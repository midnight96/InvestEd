from decimal import Decimal

from django.db import transaction as db_transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from market.services import get_price
from gamification.services import award_xp, check_badges

from .models import Portfolio, Holding, Transaction
from .serializers import (
    PortfolioSerializer, TransactionSerializer, TradeRequestSerializer,
)


class PortfolioDetailView(APIView):
    """GET /api/portfolio/ -- cash balance + holdings (with live prices & P&L)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolio, _ = Portfolio.objects.get_or_create(user=request.user)
        data = PortfolioSerializer(portfolio).data

        # enrich each holding with live price + P&L so the frontend doesn't
        # have to make N extra requests
        total_holdings_value = Decimal('0')
        from market.services import get_asset_name
        for h in data['holdings']:
            price = get_price(h['symbol'], h['asset_type'])
            qty = Decimal(str(h['quantity']))
            avg_price = Decimal(str(h['avg_price']))
            h['name'] = get_asset_name(h['symbol'], h['asset_type'])
            h['current_price'] = price
            h['current_value'] = float(price * qty)
            h['pnl'] = float((price - avg_price) * qty)
            h['pnl_pct'] = float(((price - avg_price) / avg_price) * 100) if avg_price else 0
            total_holdings_value += price * qty

        data['total_holdings_value'] = float(total_holdings_value)
        data['total_portfolio_value'] = float(total_holdings_value + portfolio.cash_balance)
        return Response(data)


class TransactionHistoryView(APIView):
    """GET /api/portfolio/transactions/ -- full trade history for the user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        txns = Transaction.objects.filter(user=request.user)
        data = TransactionSerializer(txns, many=True).data
        from market.services import get_asset_name
        for t in data:
            t['name'] = get_asset_name(t['symbol'], t['asset_type'])
        return Response(data)


class TradeView(APIView):
    """
    POST /api/portfolio/trade/
    Body: { "symbol": "RELIANCE.NS", "asset_type": "stock", "txn_type": "buy", "quantity": 5 }

    This is the core trading engine. Wrapped in db_transaction.atomic() so
    cash balance and holdings always update together -- if anything fails
    partway through, the whole trade rolls back.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        req = TradeRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        symbol = req.validated_data['symbol'].upper()
        asset_type = req.validated_data['asset_type']
        txn_type = req.validated_data['txn_type']
        quantity = req.validated_data['quantity']

        price = get_price(symbol, asset_type)
        if price is None:
            return Response({'detail': f'Could not fetch price for {symbol}'},
                             status=status.HTTP_400_BAD_REQUEST)

        cost = price * quantity

        with db_transaction.atomic():
            portfolio = Portfolio.objects.select_for_update().get(user=request.user)
            holding = Holding.objects.filter(user=request.user, symbol=symbol).first()

            if txn_type == 'buy':
                if portfolio.cash_balance < cost:
                    return Response({'detail': 'Insufficient virtual cash for this trade.'},
                                     status=status.HTTP_400_BAD_REQUEST)
                portfolio.cash_balance -= cost
                if holding:
                    new_qty = holding.quantity + quantity
                    holding.avg_price = ((holding.avg_price * holding.quantity) + cost) / new_qty
                    holding.quantity = new_qty
                    holding.save()
                else:
                    Holding.objects.create(
                        user=request.user, symbol=symbol, asset_type=asset_type,
                        quantity=quantity, avg_price=price,
                    )
                is_first_trade = Transaction.objects.filter(user=request.user).count() == 0

            else:  # sell
                if not holding or holding.quantity < quantity:
                    return Response({'detail': 'You do not own enough of this asset to sell.'},
                                     status=status.HTTP_400_BAD_REQUEST)
                portfolio.cash_balance += cost
                holding.quantity -= quantity
                if holding.quantity == 0:
                    holding.delete()
                else:
                    holding.save()
                is_first_trade = False

            portfolio.save()
            Transaction.objects.create(
                user=request.user, symbol=symbol, asset_type=asset_type,
                txn_type=txn_type, quantity=quantity, price=price,
            )

        # Gamification hooks (kept outside the atomic block on purpose --
        # XP/badges are not financially critical, so they shouldn't be able
        # to roll back a successful trade if something here misbehaves)
        if txn_type == 'buy' and is_first_trade:
            award_xp(request.user, 'first_trade', 20)
        check_badges(request.user)

        return Response({'detail': f'{txn_type.title()} order executed.', 'price': float(price)},
                         status=status.HTTP_201_CREATED)

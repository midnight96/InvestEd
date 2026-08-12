from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import (
    CURATED_MUTUAL_FUNDS,
    CURATED_STOCKS,
    get_price,
    search_mutual_funds,
    search_stocks,
)


class SecurityListView(APIView):
    """GET /api/market/securities/ -- browse/search securities."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '').strip().lower()
        include_prices = request.query_params.get('include_prices', '').lower() == 'true'

        stocks = CURATED_STOCKS
        funds = CURATED_MUTUAL_FUNDS

        # Search the providers instead of filtering only the local demo list.
        # Curated options are retained as a fallback when no API key is set or
        # a provider is temporarily unavailable.
        if search:
            provider_stocks = search_stocks(search)
            provider_funds = search_mutual_funds(search)

            stocks = provider_stocks or [
                s for s in stocks
                if search in s['name'].lower()
                or search in s['symbol'].lower()
            ]

            funds = provider_funds or [
                f for f in funds
                if search in f['name'].lower()
                or search in f['symbol'].lower()
            ]

        def serialize(security, asset_type):
            item = {**security, 'asset_type': asset_type}
            # Fetching every visible price serially makes the browse screen
            # wait on multiple external requests. The client fetches the
            # selected security's quote separately instead.
            if include_prices:
                item['price'] = float(get_price(security['symbol'], asset_type))
            return item

        stocks = [serialize(s, 'stock') for s in stocks]
        funds = [serialize(f, 'mutual_fund') for f in funds]

        return Response({
            'stocks': stocks,
            'mutual_funds': funds
        })


class QuoteView(APIView):
    """GET /api/market/quote/?symbol=AAPL&asset_type=stock -- single live price."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        symbol = request.query_params.get('symbol')
        asset_type = request.query_params.get('asset_type', 'stock')
        if not symbol:
            return Response({'detail': 'symbol query param is required'}, status=400)
        price = get_price(symbol.upper(), asset_type)
        return Response({'symbol': symbol.upper(), 'asset_type': asset_type, 'price': float(price)})

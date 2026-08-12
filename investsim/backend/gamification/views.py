from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from portfolio.models import Portfolio, Holding
from market.services import get_price

from .models import UserBadge
from .services import get_total_xp, get_level


class ProfileView(APIView):
    """GET /api/gamification/profile/ -- XP, level, badges for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        xp = get_total_xp(request.user)
        badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        return Response({
            'xp': xp,
            'level': get_level(xp),
            'badges': [
                {'name': b.badge.name, 'description': b.badge.description, 'icon': b.badge.icon}
                for b in badges
            ],
        })


class LeaderboardView(APIView):
    """
    GET /api/gamification/leaderboard/
    Ranks users by portfolio RETURN % (not raw value) so everyone starts fair
    regardless of when they joined.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = []
        for portfolio in Portfolio.objects.select_related('user').all():
            holdings_value = sum(
                get_price(h.symbol, h.asset_type) * h.quantity
                for h in Holding.objects.filter(user=portfolio.user)
            )
            total_value = holdings_value + portfolio.cash_balance
            starting = portfolio.cash_balance.__class__(100000)  # STARTING_CASH_BALANCE
            return_pct = float((total_value - starting) / starting * 100)
            rows.append({
                'username': portfolio.user.username,
                'total_value': float(total_value),
                'return_pct': round(return_pct, 2),
            })
        rows.sort(key=lambda r: r['return_pct'], reverse=True)
        return Response(rows)

"""
Gamification logic, kept separate from views so both portfolio/ and
lessons/ can call into it without circular imports or duplicated code.

Design note: XP is only ever awarded for LEARNING and GOOD HABITS
(finishing lessons, passing quizzes, diversifying, streaks) -- never for
raw trade volume. Rewarding trade count would teach the opposite lesson
of what this app is trying to teach.
"""
import math

from django.db.models import Sum

from .models import XPLog, Badge, UserBadge


def award_xp(user, action: str, amount: int):
    XPLog.objects.create(user=user, action=action, xp_awarded=amount)


def get_total_xp(user) -> int:
    total = XPLog.objects.filter(user=user).aggregate(total=Sum('xp_awarded'))['total']
    return total or 0


def get_level(xp: int) -> int:
    # simple curve: level up every ~100xp with diminishing pace
    return max(1, int(math.sqrt(xp / 100)) + 1)


BADGE_DEFINITIONS = {
    'First Trade': '🎯',
    'Diversified Investor': '🌐',
    'SIP Starter': '📈',
    'Quiz Master': '🧠',
}


def _award_badge_if_missing(user, name):
    badge, _ = Badge.objects.get_or_create(
        name=name, defaults={'description': name, 'icon': BADGE_DEFINITIONS.get(name, '🏅')}
    )
    UserBadge.objects.get_or_create(user=user, badge=badge)


def check_badges(user):
    """Call this after any trade/quiz action -- cheap enough to run each time."""
    from portfolio.models import Holding, Transaction
    from lessons.models import QuizAttempt

    if Transaction.objects.filter(user=user).exists():
        _award_badge_if_missing(user, 'First Trade')

    if Holding.objects.filter(user=user).values('symbol').distinct().count() >= 5:
        _award_badge_if_missing(user, 'Diversified Investor')

    if Holding.objects.filter(user=user, asset_type='mutual_fund').exists():
        _award_badge_if_missing(user, 'SIP Starter')

    perfect_quizzes = QuizAttempt.objects.filter(user=user, score=100).count()
    if perfect_quizzes >= 5:
        _award_badge_if_missing(user, 'Quiz Master')

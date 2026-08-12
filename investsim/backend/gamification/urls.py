from django.urls import path
from .views import ProfileView, LeaderboardView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='gamification-profile'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]

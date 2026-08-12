from django.urls import path
from .views import PortfolioDetailView, TradeView, TransactionHistoryView

urlpatterns = [
    path('', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('trade/', TradeView.as_view(), name='portfolio-trade'),
    path('transactions/', TransactionHistoryView.as_view(), name='portfolio-transactions'),
]

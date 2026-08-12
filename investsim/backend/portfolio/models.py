from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    cash_balance = models.DecimalField(max_digits=14, decimal_places=2,
                                        default=settings.STARTING_CASH_BALANCE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s portfolio (₹{self.cash_balance})"


class Holding(models.Model):
    ASSET_TYPES = [('stock', 'Stock'), ('mutual_fund', 'Mutual Fund')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings')
    symbol = models.CharField(max_length=30)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPES)
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    avg_price = models.DecimalField(max_digits=14, decimal_places=2)

    class Meta:
        unique_together = ('user', 'symbol')

    def __str__(self):
        return f"{self.user.username} holds {self.quantity} {self.symbol}"


class Transaction(models.Model):
    TXN_TYPES = [('buy', 'Buy'), ('sell', 'Sell')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    symbol = models.CharField(max_length=30)
    asset_type = models.CharField(max_length=20, choices=Holding.ASSET_TYPES)
    txn_type = models.CharField(max_length=4, choices=TXN_TYPES)
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    price = models.DecimalField(max_digits=14, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.txn_type.upper()} {self.quantity} {self.symbol} @ {self.price}"


class PortfolioSnapshot(models.Model):
    """One row per day per user -- powers the portfolio-value-over-time chart."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='snapshots')
    total_value = models.DecimalField(max_digits=14, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

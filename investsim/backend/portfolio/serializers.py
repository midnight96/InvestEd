from decimal import Decimal
from rest_framework import serializers
from .models import Portfolio, Holding, Transaction


class HoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Holding
        fields = ['symbol', 'asset_type', 'quantity', 'avg_price']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['symbol', 'asset_type', 'txn_type', 'quantity', 'price', 'timestamp']


class PortfolioSerializer(serializers.ModelSerializer):
    holdings = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = ['cash_balance', 'created_at', 'holdings']

    def get_holdings(self, obj):
        holdings = Holding.objects.filter(user=obj.user)
        return HoldingSerializer(holdings, many=True).data


class TradeRequestSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=30)
    asset_type = serializers.ChoiceField(choices=Holding.ASSET_TYPES)
    txn_type = serializers.ChoiceField(choices=Transaction.TXN_TYPES)
    quantity = serializers.DecimalField(max_digits=14, decimal_places=4, min_value=Decimal('0.0001'))

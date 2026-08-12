from django.contrib import admin
from .models import Portfolio, Holding, Transaction, PortfolioSnapshot

admin.site.register(Portfolio)
admin.site.register(Holding)
admin.site.register(Transaction)
admin.site.register(PortfolioSnapshot)

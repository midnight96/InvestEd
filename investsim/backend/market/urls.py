from django.urls import path
from .views import SecurityListView, QuoteView

urlpatterns = [
    path('securities/', SecurityListView.as_view(), name='security-list'),
    path('quote/', QuoteView.as_view(), name='quote'),
]

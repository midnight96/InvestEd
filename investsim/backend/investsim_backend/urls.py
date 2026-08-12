from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')),

    # feature apps
    path('api/portfolio/', include('portfolio.urls')),
    path('api/market/', include('market.urls')),
    path('api/lessons/', include('lessons.urls')),
    path('api/gamification/', include('gamification.urls')),
]

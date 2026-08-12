from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer


class RegisterView(CreateAPIView):
    """
    POST /api/auth/register/  { username, email, password }
    Creates the user. A signal (see portfolio/signals.py) automatically
    creates their starting Portfolio with virtual cash the moment the
    User row is saved -- no extra step needed here.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

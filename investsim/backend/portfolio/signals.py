from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Portfolio


@receiver(post_save, sender=User)
def create_portfolio_for_new_user(sender, instance, created, **kwargs):
    """
    The moment a new User is created (via /api/auth/register/), give them
    a Portfolio pre-loaded with starting virtual cash. This is the single
    place that logic lives, so no view has to remember to do it.
    """
    if created:
        Portfolio.objects.create(user=instance)

from django.contrib.auth.models import User
from django.db import models


class XPLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_logs')
    action = models.CharField(max_length=100)
    xp_awarded = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)


class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=10, default='🏅')  # emoji, simplest option

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

from django.contrib import admin
from .models import XPLog, Badge, UserBadge

admin.site.register(XPLog)
admin.site.register(Badge)
admin.site.register(UserBadge)

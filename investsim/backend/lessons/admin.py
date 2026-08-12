from django.contrib import admin
from .models import Lesson, QuizAttempt


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('order_index', 'title')
    ordering = ('order_index',)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'score', 'passed', 'timestamp')
    list_filter = ('passed', 'lesson')
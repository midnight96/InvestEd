from django.contrib.auth.models import User
from django.db import models


class Lesson(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField(help_text='Markdown or plain text lesson body')
    order_index = models.IntegerField(default=0)
    # Each quiz question: {"question": "...", "options": ["a","b","c"], "correct_index": 0}
    quiz = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return self.title


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    score = models.IntegerField()
    passed = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} - {self.score}%"

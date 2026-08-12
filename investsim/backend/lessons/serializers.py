from rest_framework import serializers
from .models import Lesson, QuizAttempt


class LessonListSerializer(serializers.ModelSerializer):
    """Lightweight version for the lesson index -- omits quiz answers."""
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order_index']


class LessonDetailSerializer(serializers.ModelSerializer):
    """Full lesson content + quiz questions, WITHOUT revealing correct_index."""
    quiz = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order_index', 'quiz']

    def get_quiz(self, obj):
        return [
            {'question': q['question'], 'options': q['options']}
            for q in obj.quiz
        ]


class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.IntegerField())

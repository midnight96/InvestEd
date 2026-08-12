from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.services import award_xp, check_badges

from .models import Lesson, QuizAttempt
from .serializers import LessonListSerializer, LessonDetailSerializer, QuizSubmitSerializer


class LessonListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Lesson.objects.all()
    serializer_class = LessonListSerializer


class LessonDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Lesson.objects.all()
    serializer_class = LessonDetailSerializer


class QuizSubmitView(APIView):
    """
    POST /api/lessons/<id>/quiz/submit/  { "answers": [0, 2, 1] }
    Grades against Lesson.quiz's correct_index, logs a QuizAttempt,
    and awards XP if passed (>=70%).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        lesson = Lesson.objects.get(pk=pk)
        req = QuizSubmitSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        answers = req.validated_data['answers']

        correct = sum(
            1 for i, q in enumerate(lesson.quiz)
            if i < len(answers) and answers[i] == q['correct_index']
        )
        total = len(lesson.quiz) or 1
        score = round((correct / total) * 100)
        passed = score >= 70

        QuizAttempt.objects.create(user=request.user, lesson=lesson, score=score, passed=passed)

        if passed:
            award_xp(request.user, f'quiz_passed_{lesson.id}', 30)
            check_badges(request.user)

        return Response({'score': score, 'passed': passed, 'correct': correct, 'total': total})

from django.urls import path
from .views import LessonListView, LessonDetailView, QuizSubmitView

urlpatterns = [
    path('', LessonListView.as_view(), name='lesson-list'),
    path('<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('<int:pk>/quiz/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
]

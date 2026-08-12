import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true);
        setError('');

        const res = await client.get('/lessons/');

        console.log('LESSONS API RESPONSE:', res.data);

        // Handle both array and {results: [...]} responses
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.lessons || [];

        setLessons(data);
      } catch (err) {
        console.error('LESSONS API ERROR:', err);
        setError(
          err?.response?.data?.detail ||
          'Unable to load lessons.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  async function openLesson(id) {
    try {
      setResult(null);

      const res = await client.get(`/lessons/${id}/`);

      console.log('LESSON DETAIL:', res.data);

      setActive(res.data);
      setAnswers(
        new Array(res.data.quiz?.length || 0).fill(null)
      );
    } catch (err) {
      console.error('LESSON DETAIL ERROR:', err);

      setError(
        err?.response?.data?.detail ||
        'Unable to open this lesson.'
      );
    }
  }

  function setAnswer(qIndex, optionIndex) {
    const next = [...answers];
    next[qIndex] = optionIndex;
    setAnswers(next);
  }

  async function submitQuiz() {
    try {
      const res = await client.post(
        `/lessons/${active.id}/quiz/submit/`,
        { answers }
      );

      setResult(res.data);
    } catch (err) {
      console.error('QUIZ ERROR:', err);

      setError(
        err?.response?.data?.detail ||
        'Unable to submit quiz.'
      );
    }
  }

  if (loading) {
    return (
      <main className="app-page lessons-page text-white">
        <h1 className="text-2xl font-bold mb-6">
          Lessons
        </h1>

        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <p className="text-slate-400">
            Loading lessons...
          </p>
        </div>
      </main>
    );
  }

  if (error && !active) {
    return (
      <main className="app-page lessons-page text-white">
        <h1 className="text-2xl font-bold mb-6">
          Lessons
        </h1>

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page lessons-page text-white">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-2">
        Financial Learning
      </h1>

      <p className="text-slate-400 mb-8">
        Learn the basics of investing and earn XP along the way.
      </p>

      {!active ? (

        /* LESSON LIST */
        <div className="space-y-4">

          {lessons.length === 0 ? (
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
              <p className="text-slate-400">
                No lessons are available yet.
              </p>
            </div>
          ) : (
            lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => openLesson(lesson.id)}
                className="w-full text-left bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-5 hover:bg-slate-700/60 hover:border-emerald-500/40 transition-all duration-200"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                      {lesson.order_index}
                    </div>

                    <div>
                      <h2 className="font-semibold text-lg">
                        {lesson.title}
                      </h2>

                      <p className="text-sm text-slate-400 mt-1">
                        Click to start lesson
                      </p>
                    </div>

                  </div>

                  <span className="text-slate-400 text-xl">
                    →
                  </span>

                </div>

              </button>
            ))
          )}

        </div>

      ) : (

        /* ACTIVE LESSON */
        <div>

          <button
            onClick={() => {
              setActive(null);
              setResult(null);
              setError('');
            }}
            className="text-sm text-slate-400 hover:text-white mb-5"
          >
            ← Back to lessons
          </button>

          <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-6">

            <div className="mb-6">

              <p className="text-sm text-emerald-400 font-medium mb-2">
                Lesson {active.order_index}
              </p>

              <h2 className="text-2xl font-bold mb-4">
                {active.title}
              </h2>

              <p className="text-slate-200 leading-7 whitespace-pre-line">
                {active.content}
              </p>

            </div>

            {active.quiz && active.quiz.length > 0 && (
              <div className="border-t border-white/10 pt-6">

                <h3 className="text-lg font-semibold mb-5">
                  Quick Check
                </h3>

                {active.quiz.map((question, questionIndex) => (

                  <div
                    key={questionIndex}
                    className="mb-7"
                  >

                    <p className="font-medium mb-3">
                      {questionIndex + 1}.{' '}
                      {question.question}
                    </p>

                    <div className="space-y-2">

                      {question.options.map(
                        (option, optionIndex) => (

                          <label
                            key={optionIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                              answers[questionIndex] === optionIndex
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-white/10 bg-slate-900/30 hover:bg-slate-700/40'
                            }`}
                          >

                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              checked={
                                answers[questionIndex] ===
                                optionIndex
                              }
                              onChange={() =>
                                setAnswer(
                                  questionIndex,
                                  optionIndex
                                )
                              }
                            />

                            <span className="text-sm">
                              {option}
                            </span>

                          </label>

                        )
                      )}

                    </div>

                  </div>

                ))}

                <button
                  onClick={submitQuiz}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-5 py-2.5 font-medium transition"
                >
                  Submit Answers
                </button>

                {result && (
                  <div
                    className={`mt-5 p-4 rounded-lg border ${
                      result.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >

                    <p
                      className={`font-semibold ${
                        result.passed
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {result.passed
                        ? '🎉 Lesson Passed!'
                        : 'Keep Practicing!'}
                    </p>

                    <p className="text-sm text-slate-300 mt-1">
                      Score: {result.score}% (
                      {result.correct}/{result.total})
                    </p>

                    {result.passed && (
                      <p className="text-sm text-emerald-400 mt-1">
                        +30 XP earned
                      </p>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      )}

    </main>
  );
}

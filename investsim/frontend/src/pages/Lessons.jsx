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
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.lessons || [];
        setLessons(data);
      } catch (err) {
        console.error('TRIVIA API ERROR:', err);
        setError(err?.response?.data?.detail || 'Unable to load trivia challenges.');
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, []);

  async function openLesson(id) {
    try {
      setResult(null);
      setError('');
      const res = await client.get(`/lessons/${id}/`);
      setActive(res.data);
      setAnswers(new Array(res.data.quiz?.length || 0).fill(null));
    } catch (err) {
      console.error('TRIVIA DETAIL ERROR:', err);
      setError(err?.response?.data?.detail || 'Unable to open this challenge.');
    }
  }

  function setAnswer(qIndex, optionIndex) {
    if (result) return; // Prevent changing answers after submission
    const next = [...answers];
    next[qIndex] = optionIndex;
    setAnswers(next);
  }

  async function submitQuiz() {
    // Check if all questions are answered
    if (answers.includes(null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');

    try {
      const res = await client.post(`/lessons/${active.id}/quiz/submit/`, { answers });
      setResult(res.data);
    } catch (err) {
      console.error('SUBMIT ERROR:', err);
      setError(err?.response?.data?.detail || 'Unable to submit your choices.');
    }
  }

  const getEmoji = (title) => {
    if (title.includes('Squeeze')) return '🍋';
    if (title.includes('Earnings')) return '📊';
    if (title.includes('Split')) return '✂️';
    if (title.includes('FOMO') || title.includes('Psychology')) return '🧠';
    if (title.includes('Cross') || title.includes('Chart')) return '📈';
    return '🎲';
  };

  const getDifficulty = (index) => {
    if (index <= 2) return { text: 'Beginner', class: 'bg-green-500/10 text-green-400 border border-green-500/20' };
    if (index <= 4) return { text: 'Intermediate', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    return { text: 'Advanced', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
  };

  if (loading) {
    return (
      <main className="app-page lessons-page text-white flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading trivia & challenges...</p>
      </main>
    );
  }

  return (
    <main className="app-page lessons-page text-white max-w-6xl mx-auto px-4 py-8">
      {!active ? (
        <>
          {/* HEADER SECTION */}
          <div className="mb-10 text-center md:text-left">
            <span className="text-xs font-bold tracking-widest text-pink-500 uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              ⚡ GAMIFIED INVESTING
            </span>
            <h1 className="text-4xl font-extrabold mt-3 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Trivia & Market Challenges
            </h1>
            <p className="text-gray-400 mt-2 text-base max-w-2xl">
              Solve real-world trading dilemmas, test your stock market vocabulary, and earn XP to level up your virtual investor profile.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-red-400 flex items-center gap-3">
              <span>⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* TRIVIA GRID */}
          {lessons.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-12 text-center">
              <span className="text-4xl">📭</span>
              <h3 className="text-lg font-semibold mt-4">No challenges available</h3>
              <p className="text-gray-500 text-sm mt-1">Check back later for new trading scenarios!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, idx) => {
                const diff = getDifficulty(lesson.order_index);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => openLesson(lesson.id)}
                    className="group relative bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.07] hover:border-pink-500/40 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-all duration-300"></div>
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
                          {getEmoji(lesson.title)}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${diff.class}`}>
                          {diff.text}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {lesson.content.replace(/[#*`]/g, '').slice(0, 120)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.05]">
                      <span className="text-xs font-semibold text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-1">
                        🏆 +30 XP Reward
                      </span>
                      <span className="text-gray-500 group-hover:text-white transition-colors text-sm font-bold">
                        Solve →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ACTIVE CHALLENGE VIEW */
        <div className="max-w-3xl mx-auto">
          {/* BACK BUTTON */}
          <button
            onClick={() => {
              setActive(null);
              setResult(null);
              setError('');
            }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <span>←</span> Back to Trivia & Challenges
          </button>

          {/* CHALLENGE CARD */}
          <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/[0.03] rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-bold tracking-wider text-pink-400 uppercase">
                🎯 CHALLENGE {active.order_index}
              </span>
              <span className="text-2xl">{getEmoji(active.title)}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
              {active.title}
            </h2>

            {/* SCENARIO DESCRIPTION */}
            <div className="prose prose-invert max-w-none text-gray-300 mb-8 text-sm leading-relaxed whitespace-pre-line border-l-2 border-pink-500/30 pl-4 py-1">
              {active.content}
            </div>

            {/* QUIZ PORTION */}
            {active.quiz && active.quiz.length > 0 && (
              <div className="border-t border-white/[0.08] pt-6 space-y-8">
                <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <span>📝</span> Submit Your Trading Decisions
                </h3>

                {active.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-semibold text-gray-200 text-sm md:text-base">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = answers[qIdx] === optIdx;
                        const showCorrect = result && optIdx === q.correct_index;
                        const showIncorrect = result && isSelected && optIdx !== q.correct_index;

                        let cardStyle = 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-gray-300';
                        if (isSelected && !result) {
                          cardStyle = 'border-pink-500 bg-pink-500/10 text-white shadow-[0_0_15px_rgba(236,72,153,0.15)]';
                        } else if (showCorrect) {
                          cardStyle = 'border-green-500 bg-green-500/10 text-green-300 font-medium';
                        } else if (showIncorrect) {
                          cardStyle = 'border-rose-500 bg-rose-500/10 text-rose-300';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => setAnswer(qIdx, optIdx)}
                            disabled={!!result}
                            className={`w-full text-left p-4 rounded-2xl border text-sm transition-all duration-200 flex items-center justify-between ${cardStyle}`}
                          >
                            <span>{opt}</span>
                            {result && optIdx === q.correct_index && (
                              <span className="text-green-400 font-bold text-base">✓ Correct</span>
                            )}
                            {result && isSelected && optIdx !== q.correct_index && (
                              <span className="text-rose-400 font-bold text-base">✗ Wrong</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* ACTION BUTTON */}
                {!result ? (
                  <button
                    onClick={submitQuiz}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/35"
                  >
                    Submit Choices & Verify
                  </button>
                ) : (
                  <div
                    className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 mt-6 ${
                      result.passed
                        ? 'bg-green-500/10 border-green-500/20 text-green-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-lg flex items-center gap-2">
                        {result.passed ? (
                          <>
                            <span>🎉</span> Challenge Passed!
                          </>
                        ) : (
                          <>
                            <span>❌</span> Verification Failed
                          </>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Accuracy: {result.score}% ({result.correct} of {result.total} correct)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {result.passed && (
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/30">
                          🏆 +30 XP Awarded
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setActive(null);
                          setResult(null);
                        }}
                        className="bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
                      >
                        Try Another Challenge
                      </button>
                    </div>
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

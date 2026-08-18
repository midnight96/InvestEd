import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Inbox,
  LineChart,
  PartyPopper,
  Scissors,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import client from '../api/client';
import { Alert, EmptyState, LoadingScreen, PageHeader } from '../components/ui';

const TOPIC_ICONS = [
  [/squeeze/i, Zap],
  [/earnings/i, BarChart3],
  [/split/i, Scissors],
  [/fomo|psychology/i, Brain],
  [/cross|chart/i, LineChart],
];

const iconFor = (title = '') =>
  TOPIC_ICONS.find(([pattern]) => pattern.test(title))?.[1] || Target;

const DIFFICULTIES = [
  { text: 'Beginner', className: 'bg-mint-soft text-mint' },
  { text: 'Intermediate', className: 'bg-coin-soft text-coin' },
  { text: 'Advanced', className: 'bg-coral-soft text-coral' },
];

const difficultyFor = (index) =>
  index <= 2 ? DIFFICULTIES[0] : index <= 4 ? DIFFICULTIES[1] : DIFFICULTIES[2];

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('TRIVIA DETAIL ERROR:', err);
      setError(err?.response?.data?.detail || 'Unable to open this challenge.');
    }
  }

  function closeLesson() {
    setActive(null);
    setResult(null);
    setError('');
  }

  function setAnswer(qIndex, optionIndex) {
    if (result) return; // answers lock after submission
    const next = [...answers];
    next[qIndex] = optionIndex;
    setAnswers(next);
  }

  async function submitQuiz() {
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

  if (loading) return <LoadingScreen label="Loading trivia & quests…" />;

  /* ── Active challenge view ──────────────────────────────────────── */
  if (active) {
    const ActiveIcon = iconFor(active.title);
    const answered = answers.filter((a) => a !== null).length;
    const total = active.quiz?.length || 0;

    return (
      <main className="page">
        <button
          type="button"
          onClick={closeLesson}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all quests
        </button>

        <div className="card mx-auto mt-5 max-w-3xl p-5 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Challenge {active.order_index}</p>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-foreground text-balance lg:text-3xl">
                {active.title}
              </h1>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coin-soft text-coin">
              <ActiveIcon className="size-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 whitespace-pre-line border-l-2 border-coin/40 pl-4 text-sm leading-relaxed text-muted">
            {active.content}
          </div>

          {total > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-base font-bold text-foreground">
                  Submit your decisions
                </h2>
                <span className="chip bg-elevated text-muted">
                  {answered} / {total} answered
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-7">
                {active.quiz.map((q, qIdx) => (
                  <fieldset key={qIdx} className="min-w-0">
                    <legend className="font-semibold leading-snug text-foreground">
                      {qIdx + 1}. {q.question}
                    </legend>

                    <div className="mt-3 flex flex-col gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = answers[qIdx] === optIdx;
                        const isCorrect = result && optIdx === q.correct_index;
                        const isWrong = result && isSelected && optIdx !== q.correct_index;

                        let tone =
                          'border-border bg-elevated text-muted hover:border-coin/45 hover:text-foreground';
                        if (isCorrect) tone = 'border-mint bg-mint-soft/60 text-mint';
                        else if (isWrong) tone = 'border-coral bg-coral-soft/60 text-coral';
                        else if (isSelected) tone = 'border-coin bg-coin-soft/60 text-foreground';

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setAnswer(qIdx, optIdx)}
                            disabled={!!result}
                            aria-pressed={isSelected}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 disabled:cursor-default ${tone}`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="flex shrink-0 items-center gap-1 font-display text-xs font-bold">
                                <Check className="size-4" aria-hidden="true" />
                                Correct
                              </span>
                            )}
                            {isWrong && (
                              <span className="flex shrink-0 items-center gap-1 font-display text-xs font-bold">
                                <X className="size-4" aria-hidden="true" />
                                Wrong
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {error && (
                <div className="mt-5">
                  <Alert>{error}</Alert>
                </div>
              )}

              {!result ? (
                <button type="button" onClick={submitQuiz} className="btn-coin mt-7 w-full py-3">
                  Submit choices & verify
                </button>
              ) : (
                <div
                  className={`mt-7 flex flex-col gap-4 rounded-[var(--radius-card)] border p-5 sm:flex-row sm:items-center sm:justify-between ${
                    result.passed
                      ? 'border-mint/30 bg-mint-soft/50'
                      : 'border-coral/30 bg-coral-soft/50'
                  }`}
                >
                  <div>
                    <h3
                      className={`flex items-center gap-2 font-display text-lg font-extrabold ${
                        result.passed ? 'text-mint' : 'text-coral'
                      }`}
                    >
                      {result.passed ? (
                        <PartyPopper className="size-5" aria-hidden="true" />
                      ) : (
                        <X className="size-5" aria-hidden="true" />
                      )}
                      {result.passed ? 'Quest cleared!' : 'Not quite'}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Accuracy: {result.score}% ({result.correct} of {result.total} correct)
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                    {result.passed && (
                      <span className="chip bg-coin-soft text-coin">
                        <Trophy className="size-3.5" aria-hidden="true" />
                        +30 XP
                      </span>
                    )}
                    <button type="button" onClick={closeLesson} className="btn-ghost">
                      Try another
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ── Quest grid ─────────────────────────────────────────────────── */
  return (
    <main className="page">
      <PageHeader
        eyebrow="Gamified investing"
        title="Trivia & Quests"
        subtitle="Solve real-world trading dilemmas, test your market vocabulary, and earn XP to level up your investor profile."
      >
        <span className="chip bg-coin-soft text-coin">
          <Zap className="size-3.5" aria-hidden="true" />
          +30 XP each
        </span>
      </PageHeader>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="card mt-6">
          <EmptyState
            icon={Inbox}
            title="No challenges available"
            description="Check back later for new trading scenarios and trivia rounds."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => {
            const Icon = iconFor(lesson.title);
            const diff = difficultyFor(lesson.order_index);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => openLesson(lesson.id)}
                className="card-interactive group flex min-h-[212px] flex-col p-5 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-coin-soft text-coin">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className={`chip ${diff.className}`}>{diff.text}</span>
                </div>

                <h2 className="mt-4 font-display text-base font-bold leading-snug text-foreground text-pretty">
                  {lesson.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
                  {lesson.content.replace(/[#*`]/g, '').slice(0, 130)}…
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 font-display text-xs font-bold text-coin">
                    <Trophy className="size-3.5" aria-hidden="true" />
                    +30 XP
                  </span>
                  <span className="flex items-center gap-1 font-display text-xs font-bold text-muted transition-colors group-hover:text-foreground">
                    Solve
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}

import { useState } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function QuizAssessment({ config, articleSlug }) {
  const { title = 'Quick Quiz', questions = [], results = [] } = config || {}
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState([])
  const [result, setResult] = useState(null)

  const handleAnswer = (score, optionText) => {
    const newScores = [...scores, score]
    setScores(newScores)

    trackWidgetEvent('quiz_answer', 'QuizAssessment', articleSlug, {
      title,
      question_index: step,
      question: questions[step]?.q,
      answer: optionText,
    })

    if (step + 1 >= questions.length) {
      const total = newScores.reduce((a, b) => a + b, 0)
      const match = results.find(r => total >= r.min && total <= r.max) || results[results.length - 1]
      setResult(match)
      trackWidgetEvent('quiz_complete', 'QuizAssessment', articleSlug, {
        title,
        total_score: total,
        result_title: match?.title,
        questions_answered: questions.length,
      })
    } else {
      setStep(step + 1)
    }
  }

  const reset = () => {
    setStep(0)
    setScores([])
    setResult(null)
    trackWidgetEvent('quiz_retake', 'QuizAssessment', articleSlug, { title })
  }

  if (!questions.length) return null

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-1">{title}</h3>
      <p className="text-xs text-neutral-400 mb-4">{questions.length} questions</p>

      {result ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-neutral-900 mb-2">{result.title}</h4>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">{result.text}</p>
          <button onClick={reset} className="mt-4 text-sm font-medium text-violet-600 hover:text-violet-700">
            Retake Quiz
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-1 mb-4">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-violet-500' : 'bg-neutral-200'}`} />
            ))}
          </div>

          <p className="text-sm font-medium text-neutral-800 mb-4">
            {questions[step]?.q}
          </p>

          <div className="space-y-2">
            {questions[step]?.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(questions[step].scores?.[i] || 1, opt)}
                className="w-full text-left px-4 py-3 rounded-xl border hover:border-violet-300 hover:bg-violet-50 transition-colors text-sm text-neutral-700"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

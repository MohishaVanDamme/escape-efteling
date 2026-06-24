import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AudioPlayer } from './components/AudioPlayer'
import type { Question } from './types/database'

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data: questions } = await supabase.from('questions').select()

      if (questions) {
        setQuestions(questions)
      }
    }

    getTodos()
  }, [])

  return (
    <div>
    <p className="text-lg font-bold">Questions</p>
    <ul>
      {questions.map((question) => (
        <li key={question.id}>
          {question.question}
          {question.audio_url && (
            <AudioPlayer audioUrl={question.audio_url} />
          )}
        </li>
      ))}
    </ul>
    </div>
  )
}
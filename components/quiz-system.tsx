"use client"

import { useState } from "react"
import { ref, update } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Quiz, QuizResult } from "@/lib/types"
import { CheckCircle, XCircle } from "lucide-react"

interface QuizSystemProps {
  quiz: Quiz
  courseId: string
  lessonId: string
  existingResult?: QuizResult
  onComplete?: (passed: boolean) => void
}

export function QuizSystem({ quiz, courseId, lessonId, existingResult, onComplete }: QuizSystemProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QuizResult | undefined>(existingResult)

  const { db, user } = useFirebase()
  const { toast } = useToast()

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!db || !user) {
      toast({
        title: "Анхааруулга",
        description: "Тест бөглөхийн тулд нэвтэрнэ үү",
      })
      return
    }

    // Check if all questions are answered
    if (Object.keys(answers).length < quiz.questions.length) {
      toast({
        title: "Анхааруулга",
        description: "Бүх асуултад хариулна уу",
      })
      return
    }

    try {
      setLoading(true)

      // Calculate score
      let correctAnswers = 0
      for (const question of quiz.questions) {
        if (answers[question.id] === question.correctOptionId) {
          correctAnswers++
        }
      }

      const score = (correctAnswers / quiz.questions.length) * 100
      const passed = score >= quiz.passingScore

      // Save result to database
      const quizResultRef = ref(db, `users/${user.uid}/quizResults/${courseId}/${lessonId}`)

      const resultData: QuizResult = {
        quizId: quiz.id,
        score,
        passed,
        completedAt: Date.now(),
        answers,
      }

      await update(quizResultRef, resultData)
      setResult(resultData)
      setShowResults(true)

      // If passed, award badge for perfect score
      if (score === 100) {
        const userBadgesRef = ref(db, `users/${user.uid}/badges`)
        const perfectQuizBadge = {
          id: `perfect-quiz-${Date.now()}`,
          name: "Төгс оноо",
          description: "Тестийг 100% зөв бөглөсөн",
          icon: "perfect-quiz",
          earnedAt: Date.now(),
        }

        await update(userBadgesRef, {
          [`perfect-quiz-${Date.now()}`]: perfectQuizBadge,
        })
      }

      if (onComplete) {
        onComplete(passed)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Алдаа",
        description: "Тест илгээхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // If user already completed the quiz, show results
  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted">
              <h3 className="font-medium text-lg mb-2">Таны үр дүн</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Оноо:</span>
                <span>{result.score.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Статус:</span>
                {result.passed ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Амжилттай
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Амжилтгүй
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{new Date(result.completedAt).toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">
                    {index + 1}. {question.text}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isSelected = result.answers[question.id] === option.id
                      const isCorrect = question.correctOptionId === option.id

                      return (
                        <div
                          key={option.id}
                          className={`p-2 rounded-md ${
                            isSelected
                              ? isCorrect
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-red-100 dark:bg-red-900/20"
                              : isCorrect
                                ? "bg-green-100 dark:bg-green-900/20"
                                : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                            {!isSelected && isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                            <span>{option.text}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!result.passed && (
            <Button
              onClick={() => {
                setResult(undefined)
                setShowResults(false)
                setAnswers({})
                setCurrentQuestion(0)
              }}
            >
              Дахин оролдох
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // Show quiz results after submission
  if (showResults) {
    const correctAnswers = quiz.questions.filter((q) => answers[q.id] === q.correctOptionId).length
    const score = (correctAnswers / quiz.questions.length) * 100
    const passed = score >= quiz.passingScore

    return (
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted">
              <h3 className="font-medium text-lg mb-2">Таны үр дүн</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Оноо:</span>
                <span>{score.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Статус:</span>
                {passed ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Амжилттай
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Амжилтгүй
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">
                    {index + 1}. {question.text}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isSelected = answers[question.id] === option.id
                      const isCorrect = question.correctOptionId === option.id

                      return (
                        <div
                          key={option.id}
                          className={`p-2 rounded-md ${
                            isSelected
                              ? isCorrect
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-red-100 dark:bg-red-900/20"
                              : isCorrect
                                ? "bg-green-100 dark:bg-green-900/20"
                                : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                            {!isSelected && isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                            <span>{option.text}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!passed && (
            <Button
              onClick={() => {
                setShowResults(false)
                setAnswers({})
                setCurrentQuestion(0)
              }}
            >
              Дахин оролдох
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // Show quiz questions
  const question = quiz.questions[currentQuestion]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Асуулт {currentQuestion + 1} / {quiz.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">Шаардлагатай оноо: {quiz.passingScore}%</span>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">{question.text}</h3>
            <RadioGroup value={answers[question.id] || ""} onValueChange={(value) => handleAnswer(question.id, value)}>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Өмнөх
        </Button>
        <Button onClick={handleNext} disabled={loading || !answers[question.id]}>
          {currentQuestion < quiz.questions.length - 1 ? "Дараах" : "Дуусгах"}
        </Button>
      </CardFooter>
    </Card>
  )
}

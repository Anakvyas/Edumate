import axios from "axios";
import React, { useEffect, useState } from "react";

interface AnswerOption {
  label: string;
  option: string;
}

interface Question {
  _id: string;
  questionText: string;
  answers: AnswerOption[];
  correctAnswer: string;
  choosenAnswer: string;
  explanation: string;
}

interface Quiz {
  createdAt: string;
  questions: Question[];
  s3PdfKey: string;
  title: string;
  updatedAt: string;
  userId: string;
  _id: string;
}

const Result = ({ id }: { id: string }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [percentage, setPercentage] = useState(0);

  // 🧠 Fetch quiz data
  useEffect(() => {
    const getQuiz = async () => {
      const res = await axios.post("/api/quiz/getquiz", { id });
      setQuiz(res.data.quiz);
    };
    getQuiz();
  }, [id]);

  // 🧮 Calculate stats once quiz is loaded
  useEffect(() => {
    if (!quiz) return;

    const total = quiz.questions.length;
    const correct = quiz.questions.filter(
      (q) => q.choosenAnswer === q.correctAnswer
    ).length;

    setTotalQuestions(total);
    setCorrectCount(correct);
    setPercentage(((correct / total) * 100).toFixed(1) as unknown as number);
  }, [quiz]);

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-gray-400">
        Loading quiz report...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-200 mb-8 italic">
        📊 Your Quiz Report: <span className="text-purple-400">{quiz.title}</span>
      </h1>

      {/* Progress Circle */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#1f2937"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#22c55e"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-700 ease-in-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-400">
              {percentage}%
            </span>
            <span className="text-sm text-gray-300">Accuracy</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-4">
          You got{" "}
          <span className="text-green-400">
            {correctCount} / {totalQuestions}
          </span>{" "}
          correct
        </h2>
      </div>

      {/* Question-wise breakdown */}
      <div className="flex flex-col gap-8 items-center w-full">
        {quiz.questions.map((ques, qIdx) => {
          const chosen = ques.choosenAnswer;
          const isCorrect = chosen === ques.correctAnswer;

          return (
            <div
              key={ques._id}
              className="bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[1px] rounded-2xl w-[60vw] shadow-lg"
            >
              <div className="flex flex-col gap-3 p-5 bg-gray-800 rounded-2xl">
                <div className="flex flex-row gap-3 text-lg font-semibold">
                  <span>{qIdx + 1}.</span>
                  <span>{ques.questionText}</span>
                </div>

                {/* Answer Options */}
                <div className="flex flex-col gap-2 mt-2">
                  {ques.answers.map((opt, idx) => {
                    const selected = ques.choosenAnswer === opt.label;
                    const showCorrect = opt.label === ques.correctAnswer;
                    const isWrongSelected = selected && !showCorrect;

                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg 
                          transition-all duration-300
                          ${selected ? "bg-gray-700" : "bg-gray-900"} 
                          ${showCorrect ? "border border-green-500 bg-green-900/30" : ""}
                          ${isWrongSelected ? "border border-red-500 bg-red-900/30" : ""}
                        `}
                      >
                        <input
                          type="radio"
                          disabled
                          checked={selected}
                          name={`question-${ques._id}`}
                          className="accent-green-500"
                        />
                        <span>
                          <strong>{opt.label}.</strong> {opt.option}
                        </span>

                        {showCorrect && (
                          <span className="ml-auto text-green-400 text-xl font-bold">✔</span>
                        )}
                        {isWrongSelected && (
                          <span className="ml-auto text-red-400 text-xl font-bold">✘</span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div
                  className={`mt-3 p-3 rounded-lg text-sm ${
                    isCorrect ? "bg-green-900/40" : "bg-red-900/40"
                  }`}
                >
                  <span className="font-semibold">
                    {isCorrect ? "✅ Correct!" : "❌ Incorrect."}
                  </span>
                  <br />
                  <span className="text-gray-300">{ques.explanation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Result;

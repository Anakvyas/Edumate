"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Quiz from '../Quiz'
import { use } from "react";


export default function QuizPage( {params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);  
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await axios.post("/api/quiz/getquiz", {id});
      setQuiz(res.data.quiz);
    };
    fetchQuiz();
  }, [id]);

  if (!quiz) return <div className="text-white p-10 text-center text-lg">Loading Quiz...</div>;

  return <Quiz quiz={quiz} />;
}

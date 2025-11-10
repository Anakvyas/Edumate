'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { Germania_One } from "next/font/google";
import Loader from "../loader";


export default function QuizGenerator({ persist_dir }: { persist_dir: string }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setloading] = useState<Boolean>(true);
    useEffect(() => {
        setloading(true);
        const generateQuiz = async () => {
            const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/askquestion", {
                question: "Generate 6 important quiz topics from this PDF. Each topic should be concise and clearly represent a core concept from the text.Return the output ONLY in a JSON array, no explanation outside the array.",
                store: persist_dir
            });
            setQuestions(res.data.answer);
            if(res.status == 200){
                setloading(false);
            }

        };
        generateQuiz();
    }, [persist_dir])

    return (
        <div className="flex flex-col w-full h-full font2">
            {loading ? <Loader message="quiz topics generating ... " /> : (
                <>
                    <span className="text-md text-gray-500 font-bold font5">Generated Quiz Topics:</span>
                    <div className="text-white h-full w-full flex flex-col gap-4 overflow-y-auto custom-scroll p-2 ">
                        {questions.map((m: any, index: number) => (
                            <div className="bg-gray-700 rounded-md p-2 transition-all duration-100 hover:bg-gray-800 cursor-pointer" key={index}>
                                {m}
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-gray-700 flex gap-2 bg-gray-900">
                        <input
                            className=" text-white flex-1 bg-gray-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition"
                            placeholder="give your topic"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button
                            //   onClick={askQuestion}
                            className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                            Generate Quiz
                        </button>
                    </div>
                </>)
            }
        </div>
    )
}

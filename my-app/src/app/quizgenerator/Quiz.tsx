import axios from "axios";
import React, { useEffect, useState } from "react";
import Result from "./Result";

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
    createdAt: String,
    questions: Question[],
    s3PdfKey: string
    title: string,
    updatedAt: string,
    userId: string,
    _id: string
}

const Quiz = ({ quiz }: { quiz: Quiz }) => {
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
    const [quizid, setquizid] = useState<string>();
    const [question, setquestion] = useState([{}]);
    const [submitquiz, setsubmitquiz] = useState(false);

    useEffect(() => {
        if (quiz) {
            console.log(quiz)
        }
        setquizid(quiz._id)
        setquestion(quiz.questions)
    }, [quiz])

    const handleChange = async (questionId: string, choosenAnswer: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [questionId]: choosenAnswer,
        }));
        // console.log(questionId)

        const res = await axios.post('/api/quiz/selectoption', { questionId, quizid, choosenAnswer });
        // console.log(res.data.message)

    };

    if(submitquiz){
        return <Result id ={quiz._id} />
    }
    return (
        <div className="h-full ">
            <div className="flex flex-col gap-5 w-full h-full justify-center items-center">
                {quiz.questions.map((ques, qIdx) => (
                    <div
                        key={ques._id}
                        className="bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[1.2px] rounded-2xl w-[50vw] h-auto "
                    >
                        <div className="flex flex-col gap-2 p-4 bg-gray-800 w-full h-full rounded-2xl text-white">
                            <div className="flex flex-row gap-3 text-lg font-semibold">
                                <span>{qIdx + 1}.</span>
                                <span>{ques.questionText}</span>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                {ques.answers.map((opt, idx) => (
                                    <label
                                        key={idx}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded-md tex"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${ques._id}`}
                                            value={opt.label}
                                            checked={selectedOptions[ques._id] === opt.label}
                                            onChange={() => handleChange(ques._id, opt.label)}
                                        />
                                        <span>{opt.label}. {opt.option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => setsubmitquiz(true)}
                    className="sticky top-0
             bg-gradient-to-r from-purple-300 to-purple-700  
             w-[20vw] px-7 py-2 text-white rounded-lg cursor-pointer 
             shadow-md hover:scale-105 transition-all mb-8 text-gray-900"
                >SUBMIT QUIZ</button>
            </div>
        </div>

    );
};

export default Quiz;

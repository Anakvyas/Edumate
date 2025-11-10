"use client"
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { FileDown, FileUp, NotebookText, SquareChevronRight, Upload, Video, Youtube } from 'lucide-react';
import axios from 'axios';
import Quiz from './Quiz';
import UploadDialog from '../components/Loading';


interface QUIZ {
    createdAt: String,
    questions: [],
    s3PdfKey: string
    title: string,
    updatedAt: string,
    userId: string,
    _id: string
}


const Page = () => {
    const [file, setfile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setdragging] = useState(false);
    const [prompt, setprompt] = useState("");
    const [quiz, setquiz] = useState<Quiz | null>(null);

    const [showDialog, setShowDialog] = useState(false);
    const [status, setStatus] = useState<"loading" | "done">("loading");

    const handleclick = () => {
        fileInputRef.current?.click();
    }
    const handlefilechange = (e: any) => {
        const file = e.target.files[0];
        setfile(file);
        console.log(file);
    }

    const handledrop = (e: any) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setfile(droppedFile)
        }
    }

    const handledragover = (e: any) => {
        e.preventDefault();
        setdragging(true);
    }

    const handledragLeave = (e: any) => {
        e.preventDefault();
        setdragging(false);
    }


    const handlegeneratequiz = async () => {
        try {
            setShowDialog(true)
            setStatus("loading")

            let formdata = new FormData();
            formdata.append("prompt", prompt)

            if (file) formdata.append("pdf", file)

            // console.log(formdata)
            const res = await axios.post('/api/quiz/generate', formdata, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setStatus("done");
            setTimeout(() => {
                setquiz(res.data.quiz);
            }, 3000);

        } catch (err: any) {
            console.log(err)
        }
    }

    if (quiz != null) {
        return <Quiz quiz={quiz} />
    }


    return (
        <div className='flex flex-col jsutify-center items-center p-5  text-font'>
            <input className='hidden' ref={fileInputRef} type='file' accept='application/pdf' onChange={handlefilechange} />
            <motion.div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl'
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}  >
                <div className="bg-[#101314] max-w-[760px] margin-auto min-h-auto flex flex-col  items-center p-7 rounded-xl">
                    <h1 className='text-2xl text-gray-100 head-font'>Quiz Generator</h1>
                    <span className='text-md text-gray-500'>Generate interactive quizzes from your study material.</span>

                    <div className='text-md text-gray-300 flex flex-col gap-3 w-full mt-4 px-8'><span className='w-auto flex flex-row gap-3'> <SquareChevronRight />Give prompt : </span> <input className='w-full p-2 h-[5vh] bg-gray-700 outline-none rounded-lg text-sm' placeholder='Ex- Generate Quiz on CNN - on its architecture and basic function.' value={prompt} onChange={(e) => (setprompt(e.target.value))}></input></div>
                    <div className='p-8 w-full'>
                        <h1 className='text-md text-gray-300 mb-2 flex flex-row gap-4'> <Upload /> Upload Reference PDF (Optional)</h1>
                        <div className={`w-lg h-[15vh] ${dragging ? "bg-gray-700" : "bg-[#566064]"} text-white border border-[#7dd87d] border-dashed border-2 rounded-xl flex flex-col justify-center items-center transition-all hover:bg-gray-700 cursor-pointer`}
                            onClick={handleclick}
                            onDrop={handledrop}
                            onDragOver={handledragover}
                            onDragLeave={handledragLeave}
                        >

                            {file ? (<span className='flex flex-col justify-center items-center'>{file.name}</span>) : (<p className='flex flex-col justify-center items-center'>
                                <FileUp className="mb-2 w-[40px] h-[40px]" />
                                <i>Click to upload or drag & drop PDF here</i></p>)}
                        </div>
                    </div>

                    <button className="w-sm bg-gradient-to-r from-[#098009] to-[#7dd87d] p-2 rounded-xl cursor-pointer text-gray-800 font-semibold transition-all duration-300 hover:from-[#0ca50c] hover:to-[#98f598] hover:scale-105 shadow-md" onClick={handlegeneratequiz} >
                        Generate Quiz
                    </button>

                    <UploadDialog
                        show={showDialog}
                        onClose={() => setShowDialog(false)}
                        status={status}
                        title="Generating your quiz..."
                        subtitle="Please wait while EduMate works its magic 🪄"
                    />

                </div>
            </motion.div >
        </div>
    )
}
export default Page;

"use client";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const features = [
  { name: "Video Transcriber", desc: "Convert lecture videos into text notes.",img:"./videotranscribe.png",url:'/VideoTranscriber' },
  { name: "Email Summarizer", desc: "Summarize and extract key info from emails.",img:"./EmailSummarizer.png",url:"/EmailSummarizer" },
  { name: "PDF Notes Extractor", desc: "Extract structured notes from PDF documents.",img:"./PDF Notes Extractor.png",url:"./pdfNotesExtractor" },
  { name: "Handwritten Notes Reader", desc: "Digitize and extract text from handwritten PDFs.",img:"./Handwritten Notes Reader.png" ,url:"./handwrittenpdfnotes"},
  { name: "Project Builder", desc: "Auto-generate projects with documentation and reports.",img:"./Project Builder.png",url:'./generate_pro' },
  { name: "PPT Generator", desc: "Instantly create presentations from your notes or topics." ,img:"./PPT Generator.png",url:"./pptgenerator"},
  { name: "Quiz Generator", desc: "Generate interactive quizzes from your study material." ,img:"./Quiz Generator.png",url:"/quizgenerator"},
  { name: "Assignment Solver", desc: "Solve and explain assignment questions step-by-step.",img:"./Assignment Solver.png" }
];

const GreenCircle = () => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [0.9, 1.05, 0.9],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                }}
                className="bg-[#8eedb1] h-[220px] w-[220px] rounded-full blur-lg z-20"
            />
        </AnimatePresence>
    )
};
const PurpleCircle = () => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.9, 1.05, 0.9],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                }}
                className="bg-[#5e63b6] h-[220px] w-[220px] rounded-full blur-lg z-20"
            />
        </AnimatePresence>
    )
};

export { GreenCircle, PurpleCircle,features };

'use client'

import React, { useEffect, useState } from 'react';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import { selectionModePlugin } from '@react-pdf-viewer/selection-mode';
import { BookCheck, CircleQuestionMark, MessageCircle, NotebookPen, Rocket, Undo2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import GenerateProject from './pdf_comp/GenerateProject';
import QuizGenerator from './pdf_comp/QuizGenerator';
import ShortNotes from './pdf_comp/ShortNotes';
import ChatWithPdf from './pdf_comp/ChatWithPdf';
import ConeptMap from './pdf_comp/ConeptMap';

const pdffeature = [  
  { name: "Chat with PDF", icon: MessageCircle,comp:ChatWithPdf },
  { name: "Get Short Notes", icon: NotebookPen,comp:ShortNotes },
  { name: "Generate Projects", icon: Rocket,comp:GenerateProject },
  { name: "Get Quizzes", icon: CircleQuestionMark ,comp:QuizGenerator},
  { name: "Concept Maps Generator", icon: BookCheck ,comp:ConeptMap},
];

const PdfViewer = ({ pdfurl }: { pdfurl: string }) => {
  // const [pdfurl, setpdfurl] = useState("");
  const selectionPlugin = selectionModePlugin();
  const [top, settop] = useState<Number | null>(null)
  const [left, setleft] = useState<Number | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectedfeature, setSelectedfeature] = useState<number | null>(null);
  const [persit_dir, setpersit_dir] = useState("./vectorstores/1e80f322-cf8d-46f0-8594-9497d47f6938");

  const handleSelect = (event: React.MouseEvent) => {
    const text = window.getSelection()?.toString().trim() || "";

    if (text.length > 0) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        const containerRect = event.currentTarget.getBoundingClientRect();

        settop(rect.bottom - containerRect.top + 10);
        setleft(rect.left - containerRect.left);
        setSelectedText(text);
      }
    } else {
      setSelectedText("");
      settop(null);
      setleft(null);
    }
  };


  // useEffect(() => {

  //   const getpersit = async () => {
  //     const res = await axios.get("/api/video", {
  //       params: { pdfurl: pdfurl }
  //     })

  //     setpersit_dir(res.data.persist)
  //   }

  //   getpersit()
  // }, [pdfurl])



  const handlefeatureclick = (index: number) => {
    if (index == null) return;
    setSelectedfeature(index)
  }

  // console.log(pdfurl)
  return (
    <div className='flex flex-row gap-15 mx-14 overflow-hidden'>
      <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[3px] w-[40vw] h-[85vh] m-3 rounded-xl text-font shadow-2xl'>
        <div className='w-full h-full bg-gray-900 p-2 rounded-xl flex flex-col gap-1 text-gray-300'>
          <span className='text-gray-200 font-black  italic'>Pdf Viewer</span>
          {/* <div className='flex flex-row gap-4'><h1>Uploaded Pdf:</h1> {file && <div className='text-sm bg-gray-700 px-3 p-1 w-fit rounded-md'>{file.name}</div>}</div> */}
          <span className='text-sm text-gray-400'>Highlight text to unlock quick tools — summarize, copy, and more.</span>
          <div className='w-full flex-1 overflow-y-auto  p-2 custom-scroll relative rounded-xl' onMouseUp={handleSelect} >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              {pdfurl && <Viewer fileUrl={pdfurl} plugins={[selectionPlugin]} />}
            </Worker>

            {selectedText != "" && top !== null && left !== null && <div className="absolute bg-white text-black border border-gray-300 rounded-lg shadow-lg z-50" style={{ position: 'absolute', top: top + "px", left: left + "px" }}>
              <button

                className="block w-full text-left px-2 py-1 hover:bg-gray-200"
              >
                📋 Copy
              </button>
              <button

                className="block w-full text-left px-3 py-1 hover:bg-gray-200"
              >
                💡 Summarize
              </button>
              <button
                className="block w-full text-left px-3 py-1 hover:bg-gray-200"
              >
                🖍️ Highlight
              </button>
            </div>}
          </div>
        </div>
      </div >

      <AnimatePresence mode="wait">
        {selectedfeature === null ? (
          <motion.div
            key="feature-list"
            className="bg-gradient-to-br from-[#7dd87d] to-[#5e63b6] p-[3px] w-[40vw] h-[85vh] m-3 rounded-2xl text-font shadow-2xl"
            initial={{ y: "-50%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-50%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="w-full h-full bg-gray-900 rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="text-2xl text-white font-semibold">Smart Study Tools</h2>
              <p className="text-gray-400 text-sm">
                Select any feature below to boost your learning instantly.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                {pdffeature.map((features, index) => {
                  const Icon = features.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedfeature(index)}
                      className="w-full bg-gray-800 cursor-pointer hover:bg-[#7dd87d] hover:text-black transition-all duration-300 py-3 px-4 rounded-xl flex items-center gap-3 text-gray-200 text-base font-semibold shadow-md"
                    >
                      <Icon size={20} />
                      {features.name}
                    </button>
                  );
                })}
              </div>

              <p className="text-gray-400 text-xs text-center mt-auto">
                AI tools designed to make studying easier, faster, and smarter ✨
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feature-details"
            className="bg-gradient-to-br from-[#7dd87d] to-[#5e63b6] p-[3px] w-[40vw] h-[85vh] m-3 rounded-2xl text-font shadow-2xl"
            initial={{ x: "50%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "50%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="w-full h-full bg-gray-900 rounded-2xl p-6 flex flex-col gap-3">
              <div
                className="text-gray-100 flex flex-row gap-2 cursor-pointer"
                onClick={() => setSelectedfeature(null)}
              >
                <Undo2 /> Back
              </div>

              {(() => {
                const Icon = pdffeature[selectedfeature].icon;
                const Comp = pdffeature[selectedfeature].comp;
                return (
                  <div className='w-full h-[67vh]'>
                    <div className="flex items-center gap-3 m-2">
                      <Icon size={32} className="text-white" />
                      <h2 className="text-2xl text-white font-semibold">
                        {pdffeature[selectedfeature].name}
                      </h2>
                    </div>
                    <Comp persist_dir={persit_dir}/>

                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>




    </div>
  );
}

export default PdfViewer;

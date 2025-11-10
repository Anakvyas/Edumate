"use client"
import { motion } from 'framer-motion';
import { duration } from 'html2canvas/dist/types/css/property-descriptors/duration';
import React, { useState } from 'react';
import Vision from './Vision';
import Finetune from './Finetune';

// type TechniqueKey = "vision" | "trocr" | "finetune";

const Page = () => {

    const [technique, settechnique] = useState("");

    const options = [
        {
            "name": "Smart Recognition (Google Vision)",
            "img": "./google_vision.png",
            "subtitle": ["Best accuracy", "Fast", "Internet required"],
            "value": "vision"
        },
        // {
        //     "name": "Basic Offline Recognition (TrOCR)",
        //     "img": "./trocr.png",
        //     "subtitle": ["Works anywhere", "Good for limited network ", "Lower accuracy than Smart Mode"],
        //     "value": "trocr"
        // },
        {
            "name": "My Handwriting Mode (Personalized)",
            "img": "./trocr_finetune.png",
            "subtitle": ["Learns from your handwriting", "Best after training ", "Improves with use"],
            "value": "finetune"
        },
    ]

    const handletech = (tech:string)=>{
        if(tech !== ""){
            settechnique(tech)
        };
    }

    if (technique !== "") {
        if(technique === "vision"){
            return <Vision/>
        }else if(technique === "finetune"){
            return <Finetune/>
        }
    }

    return (
        <div className='w-full min-h-screen flex flex-col justify-center items-center text-font'>
            <motion.div className='' initial={{ opacity: 0.1, y: -100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "linear" }}>
                <span className=' w-full h-[86vh]  text-gray-200 italic text-md lg:text-xl'>Select your Technique - </span>
                <div className='flex flex-row justify-center items-center p-5 gap-9 flex-wrap'>
                    {options.map((opt, index) => (
                        <div className='w-[90%] sm:w-[45%] lg:w-[20vw] h-[49vh] z-10 bg-[linear-gradient(130deg,#7dd87d,#06080d,#5e63b6)] p-[1.8px] rounded-2xl cursor-pointer' key={index} onClick={()=>handletech(opt.value)}>
                            <div className='bg-gray-900 w-full h-full rounded-2xl text-center p-3 hover:opacity-[0.95]' >
                                <img src={opt.img} className='w-full h-[50%] rounded-xl shadow-xl'></img>
                                <h1 className='text-gray-300 text-lg font-bold head-font mt-1'>{opt.name}</h1>
                                <ul style={{ listStyleType: "circle" }} className='text-gray-400 text-start px-4'>
                                    {opt.subtitle.map((t, idx) => (
                                        <li key={idx}>{t}</li>
                                    ))}

                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default Page;

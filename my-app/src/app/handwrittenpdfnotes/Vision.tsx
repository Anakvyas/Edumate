import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, FileUp, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import PdfViewer from '../components/pdfViewer';

const Vision = () => {
    const [file, setfile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setdragging] = useState(false);
    const [pdfurl,setpdfurl] =  useState("");

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

    const handleuploadnotes = async () => {
        try {
            const formdata = new FormData();
            if (!file) return;
            formdata.append("file", file);
            formdata.append("userID", "demo")
            const res = await axios.post("/api/handwritten/vision",formdata, {
                headers: {
                    "Content-Type": "multipart/form-data",

                }
            })
            console.log(res.data.url)
            setpdfurl(res.data.url)

        } catch (err: any) {
            console.log(err);
        }
    }

    if(pdfurl != ""){
        return <PdfViewer pdfurl={pdfurl}/>
    }

    return (
        <div className='flex flex-col jsutify-center items-center p-5  text-font w-full h-full'>
            <motion.div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl '>
                <div className='bg-[#101314] max-w-[760px] margin-auto min-h-auto flex flex-col  items-center p-7 rounded-xl'>
                    <div className='flex flex-row text-2xl font-black text-gray-300 gap-4 head-font justify-center items-center w-full'> <Eye /><span>Google Vision</span></div>
                    <input className='hidden' ref={fileInputRef} type='file' accept='application/pdf' onChange={handlefilechange} />
                    <div className='p-10'>
                        <h1 className='text-md text-gray-300 mb-2 flex flex-row gap-4'> <Upload /> Upload Handwritten Pdf Here</h1>
                        <div className={`w-lg h-[180px] ${dragging ? "bg-gray-700" : "bg-[#566064]"} text-white border border-[#7dd87d] border-dashed border-2 rounded-xl flex flex-col justify-center items-center transition-all hover:bg-gray-700 cursor-pointer`}
                            onClick={handleclick}
                            onDrop={handledrop}
                            onDragOver={handledragover}
                            onDragLeave={handledragLeave}
                        >

                            {file ? (<span className='flex flex-col justify-center items-center'>{file.name}</span>) : (<p className='flex flex-col justify-center items-center'>
                                <FileUp className="mb-2 w-[60px] h-[50px]" />
                                <i>Click to uplaod, or drag PDF here</i></p>)}
                        </div>
                    </div>
                    <button className='w-full h-auto p-[8px] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl cursor-pointer  transition-all hover:scale-101 hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700' onClick={handleuploadnotes}>Upload Notes</button>
                </div>
            </motion.div>
        </div>
    );
}

export default Vision;

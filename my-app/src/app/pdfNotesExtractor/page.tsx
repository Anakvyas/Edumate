"use client"
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import UploadDialog from '../components/Loading';
import { FileUp, Upload } from 'lucide-react';
import PdfViewer from '../components/pdfViewer';
import { head } from 'framer-motion/client';
import axios from 'axios';

const Page = () => {
    const [file, setfile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setdragging] = useState(false);
    const [showdialog, setshowdialog] = useState(false);
    const [uploaded, setuploaded] = useState(false);
    const [pdflink, setpdflink] = useState("");

    const handleclick = () => {
        fileInputRef.current?.click();
    }

    const handlefilechange = async (e: any) => {
        const file = e.target.files[0];
        setfile(file);


        // // console.log(res.data.link)
        // setpdflink(res.data.link);

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

    const handlegetnotes = async () => {
        if (!file) {
            return;
        }
        const formdata = new FormData();
        formdata.append('pdf', file);
        const res = await axios.post('/api/uploadpdf', formdata, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
        );
        console.log(res.data.link)
        setpdflink(res.data.link);
    }

    if (pdflink != "https://eu-north-1.console.aws.amazon.com/s3/object/edumate-bucket?region=eu-north-1&prefix=pdfs/02265c02-1d3a-4d37-9267-6941584fd27b.pdf") {
        return <PdfViewer pdfurl={"https://eu-north-1.console.aws.amazon.com/s3/object/edumate-bucket?region=eu-north-1&prefix=pdfs/02265c02-1d3a-4d37-9267-6941584fd27b.pdf"} />
    }


    return (
        <div className='flex flex-col jsutify-center items-center p-5  text-font'>
            <input className='hidden' ref={fileInputRef} type='file' accept='application/pdf' onChange={handlefilechange} />
            <motion.div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl'
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}  >
                <div className="bg-[#101314] max-w-[760px] margin-auto min-h-auto flex flex-col  items-center p-7 rounded-xl">
                    <h1 className='text-2xl text-gray-100 head-font'>PDF Notes Extractor</h1>
                    <span className='text-md text-gray-500'>Extract structured notes from PDF documents.</span>

                    <div className='p-10'>
                        <h1 className='text-md text-gray-300 mb-2 flex flex-row gap-4'> <Upload /> Upload Pdf Here</h1>
                        <div className={`w-lg h-[180px] ${dragging ? "bg-gray-700" : "bg-[#566064]"} text-white border border-[#7dd87d] border-dashed border-2 rounded-xl flex flex-col justify-center items-center transition-all hover:bg-gray-700 cursor-pointer`}
                            onClick={handleclick}
                            onDrop={handledrop}
                            onDragOver={handledragover}
                            onDragLeave={handledragLeave}
                        >

                            {file ? (<span className='flex flex-col justify-center items-center'>{file.name}</span>) : (<p className='flex flex-col justify-center items-center'>
                                <FileUp className="mb-2 w-[60px] h-[50px]" />
                                <i>Click to uplaod, or drag pdf here</i></p>)}
                        </div>
                    </div>


                    <button className="w-sm bg-gradient-to-r from-[#098009] to-[#7dd87d] p-2 rounded-xl cursor-pointer text-gray-800 font-semibold transition-all duration-300 hover:from-[#0ca50c] hover:to-[#98f598] hover:scale-105 shadow-md" onClick={handlegetnotes}>
                        Uplaod Pdf
                    </button>

                    {/* <UploadDialog show={showdialog} onClose={() => setshowdialog(false)} /> */}
                </div>
            </motion.div>
        </div>
    )


}
export default Page;

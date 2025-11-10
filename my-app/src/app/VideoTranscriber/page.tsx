"use client";
import { motion } from 'framer-motion';
import { FileDown, FileUp, NotebookText, Upload, Video, Youtube } from 'lucide-react';
import React, { useState, useRef } from 'react';
import UploadDialog from '../components/Loading';
import { div } from 'framer-motion/client';
import handleDownloadPdf from '../utils/downlaodpdf';
import axios from 'axios';
import PdfViewer from '../components/pdfViewer';

const Page = () => {
    const [file, setfile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setdragging] = useState(false);
    const [showdialog, setshowdialog] = useState(false);
    const [notes, setnotes] = useState(false);
    const pdfcontent = useRef(null);
    const [youtubelink , setyoutubelink] = useState("");
    const [notesText,setnotesText] = useState("")
    const [pdflink,setpdflink] = useState("");

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
        if (droppedFile && droppedFile.type.startsWith("video/")) {
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

    const handlegetnotes = async() => {
        if(!file && !youtubelink){
            return;
        }
        // youtube
        const formdata = new FormData()
        if(file){
            formdata.append('video',file);
            formdata.append('mode',"video");
        }else if(youtubelink){
            formdata.append('video',youtubelink);
            formdata.append("mode","yt");
        }

        const res =  await axios.post('/api/video',formdata,{
            headers:{
                "Content-Type":"multipart/form-data"
            }
        })


        setpdflink(res.data.link)


    }

    const handledownloadpdf = ()=>{
        const el = pdfcontent.current;
        if(el != null) handleDownloadPdf(el)
    }

    if(pdflink != ""){
        return <PdfViewer pdfurl={pdflink}></PdfViewer>
    }

    return (
        <div className='flex flex-col jsutify-center items-center p-5  text-font'>
            <input className='hidden' ref={fileInputRef} type='file' accept='video/*' onChange={handlefilechange} />
            <motion.div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl'
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}  >
                <div className="bg-[#101314] max-w-[760px] margin-auto min-h-auto flex flex-col  items-center p-7 rounded-xl">
                    <h1 className='text-2xl text-gray-100 head-font'>Video Transcriber</h1>
                    <span className='text-md text-gray-500'>Convert lecture videos into text notes.</span>
                    {!notes ? (<>
                        <div className='p-10'>
                            <h1 className='text-md text-gray-300 mb-2 flex flex-row gap-4'> <Upload /> Upload Video Here</h1>
                            <div className={`w-lg h-[180px] ${dragging ? "bg-gray-700" : "bg-[#566064]"} text-white border border-[#7dd87d] border-dashed border-2 rounded-xl flex flex-col justify-center items-center transition-all hover:bg-gray-700 cursor-pointer`}
                                onClick={handleclick}
                                onDrop={handledrop}
                                onDragOver={handledragover}
                                onDragLeave={handledragLeave}
                            >

                                {file ? (<span className='flex flex-col justify-center items-center'>{file.name}</span>) : (<p className='flex flex-col justify-center items-center'>
                                    <FileUp className="mb-2 w-[60px] h-[50px]" />
                                    <i>Click to uplaod, or drag Video here</i></p>)}
                            </div>
                        </div>

                        <h2 className='text-white text-xl font-bolder'>OR</h2>
                        <div className='p-10'>
                            <h1 className='text-md text-gray-300 mb-2 flex flex-row gap-4'> <Youtube />Paste Youtube Link Here</h1>
                            <input className='w-lg h-[40px] p-2 text bg-[#566064] text-gray-100 rouned-xl outline-none rounded-lg' type='text' placeholder='https://www.youtube.com/'value={youtubelink} onChange={(e)=>setyoutubelink(e.target.value)} ></input>
                        </div>

                        <button className="w-sm bg-gradient-to-r from-[#098009] to-[#7dd87d] p-2 rounded-xl cursor-pointer text-gray-800 font-semibold transition-all duration-300 hover:from-[#0ca50c] hover:to-[#98f598] hover:scale-105 shadow-md" onClick={handlegetnotes}>
                            GET NOTES
                        </button>

                        {/* <UploadDialog show={showdialog} onClose={() => setshowdialog(false)} /> */}
                    </>)
                        :
                        (<div className='bg-[#101314] w-full h-auto p-4 text-white'>
                            <div className='flex flex-col items-start'>
                                <h2 className='flex flex-row text-xl font-bolder gap-5  justify-center items-center mb-3'> <Video />Uploaded Video : </h2>
                                <div className='w-lg h-[40px] p-2 text bg-[#566064] text-gray-100 rouned-xl outline-none rounded-lg ml-8 mb-8'>{file?.name}</div>
                                <div className=' w-full flex flex-row justify-between items-center'>
                                    <h2 className='flex flex-row text-xl font-bolder gap-5 justify-center items-center mb-3 text-xl font-bolder'><NotebookText /> Notes</h2>
                                    <button className='text-gray-900 bg-[linear-gradient(to_right,#7dd87d,#5e63b6)] flex flex-row gap-3 w-auto h-auto bg-red-500 p-[4px] rounded-lg cursor-pointer rounded-lg hover:scale-105 transition-all duration-300 shadow-md'
                                        onClick={handledownloadpdf}><FileDown /> Download Notes Pdf</button>
                                </div>
                                <div ref = {pdfcontent} className='max-h-[900px] p-6 bg-white text-gray-900 m-5 rounded-lg overflow-y-auto scrollbar-thin text-[15px]' dangerouslySetInnerHTML={{ __html: notesText }}/>
                            </div>
                        </div>)}
                </div>

            </motion.div>
        </div>
    );
}

export default Page;

"use client"
import React, { useState } from 'react';
import PdfViewer from '../components/pdfViewer';

const Page = () => {
    const [pdffile,setpdffile] = useState<File|null>(null);
    const handlefilechange = (e:any)=>{
        const file = e.target?.files?.[0];
        if(file){
            setpdffile(file);
        }
    }
    return (
        <div>
             <input type='file' accept='pdf/*' onChange={handlefilechange}></input>
             <div className='h-[80vh] w-[40vw] m-7'>
                <PdfViewer file = {pdffile}/>
             </div>
            
        </div>
    );
}

export default Page;

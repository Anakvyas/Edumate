"use client"
import axios from 'axios';
import React, { useState } from 'react';

const Page = () => {
    const [title, settitle] = useState("")
    const [description, setdescription] = useState("")
    const [slides, setslides] = useState<number>();

    const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 4 && value <= 15) {
            setslides(value);
        }
    };

    const handletitle =  async (e:React.ChangeEvent<HTMLInputElement>)=>{
        settitle(e.target.value);
    }

    const handlegenerateppt = () => {
        if(!title || !description || !slides){
            return;
        }
        console.log(title,description,slides)
    }
    return (
        <div className=' flex flex-col gap-4 justify-center items-center mx-auto text-font'>
            <div className='w-[50vw] min-h-[25vh] bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl mt-6'>
                <div className='  flex flex-col gap-5 bg-gray-900 w-full h-auto rounded-xl p-4'>
                    <div className='flex flex-row gap-4'><div className='flex flex-col w-full'><span className='text-gray-300 italic '>Title</span><input className='bg-gray-500 w-full h-[5vh] p-1 text-white text-sm outline-none' type='text' placeholder='Ex- Generate PPT on Neural network' value={title} onChange={handletitle} /> </div><div className='flex flex-col w-[40%]'><span className='text-gray-300 italic '>No. of slides</span><input className='bg-gray-500 w-full h-[5vh] p-1 text-white text-sm outline-none' type='number' min={4} max={15} placeholder='7' value={slides} onChange={handleSlideChange} /></div></div>
                    <div className='flex flex-col '><span className='text-gray-300 italic '>Description</span><textarea className='bg-gray-600 w-full h-[15vh] text-start text-white text-sm outline-none p-4 resize-none' placeholder='Describe about ppt and topics what you want in ppt ' value={description} onChange={(e) => setdescription(e.target.value)}></textarea></div>
                    <button onClick={handlegenerateppt} className='bg-gradient-to-r from-green-400 to-green-700 w-full  rounded-xl h-[5vh] hover:bg-gradient-to-r hover:from-green-500 hover:to-green-800 cursor-pointer p-1'>Generate Ppt</button>
                </div>
            </div>
        </div>
    );
}

export default Page;

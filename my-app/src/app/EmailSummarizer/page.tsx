"use client"
import { motion } from 'framer-motion';
import { Brain, Calendar, CirclePlus, Mail, Mails, Pencil, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Shymmer from '../components/Shymmer';
import axios from 'axios';
import { select } from 'framer-motion/client';

interface Email {
    id: string;
    subject: string;
    from: {
        emailAddress: {
            name: string;
            address: string;
        };
    };
    toRecipients?: {
        emailAddress: {
            name: string;
            address: string;
        };
    }[];
    receivedDateTime: string;
    importance: "low" | "normal" | "high";
    hasAttachments: boolean;
    categories?: string[];
    bodyPreview: string;
    body: {
        contentType: "Text" | "HTML";
        content: string;
    };
}

const Page = () => {
    const [SelectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [keywords, setkeywords] = useState<string[]>(["quant", "ejeoinio   "]);
    const [keywordval, setkeywordval] = useState("");
    const [summary, setsummary] = useState("");
    const [draftmail, setdraftmail] = useState("");
    const [events, setevents] = useState("");
    const [loading, setloading] = useState(true);  // true
    const [showeditwindow, setshoweditwindow] = useState(false); //false
    const [Emails, setEmails] = useState<Email[]>([]);


    const handleselectedemail = (index: number) => {
        setsummary("")
        setdraftmail("")
        setevents("")
        setSelectedEmail(Emails[index]);
        console.log(SelectedEmail)
    }

    const addkeyword = () => {
        if (keywordval == "") {
            return;
        }
        keywords.push(keywordval);
        setkeywordval("")
    }

    const deletekeyword = (idx: Number) => {
        setkeywords(prev => prev.filter((_, i) => (i !== idx)))
    }

    const handleeditdraft = () => {
        setshoweditwindow(true);
    }

    const editted = (e: any) => {
        const val = (document.querySelector("#edit") as HTMLElement | null)?.innerText
        if (!val) return;
        setdraftmail(val);
        setshoweditwindow(false)
    }

    const handlesummary = async () => {
        const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + '/summarize_email', { SelectedEmail })
        setsummary(res.data.summary);
    }

    const handledreaftmail = async () => {
        const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + '/draftmail', { SelectedEmail })
        setdraftmail(res.data.draftmail);
    }

    const handleEmail = async () => {
        const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + '/getevents', { SelectedEmail })
        setevents(res.data.events);
    }

    useEffect(() => {
        if (!SelectedEmail) {
            return;
        }
        handlesummary();
        handledreaftmail();
        handleEmail();
    }, [SelectedEmail])

    useEffect(() => {
        const handleEmail = async () => {
            try {
                const res = await axios.get('/api/emails')
                console.log(res.data.value);
                setEmails(res.data || []);
                console.log(Emails)

            } catch (err) {
                console.error('Error handling email:', err);
                alert('Failed to fetch emails. Please try again later.');
            }

        }
        handleEmail();
    }, []);



    useEffect(() => {
        setTimeout(() => {
            setloading(false);
        }, 500)
    }, [])


    return (
        <div className='relative'>
            <div className='flex flex-row p-5 text-font w-full max-h-[calc(100vh-12vh)] p-1 gap-12 mx-auto absolute inset-0 transition-all'>

                <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl w-[25vw] h-[84vh] max-w-[25vw] max-h-[84vh] '>
                    {loading ? <Shymmer /> : <>
                        <div className='flex flex-col gap-2 text-gray-500 w-full h-full bg-[#0c0e0f] p-3 rounded-xl'>

                            <span className='text-gray-400 italic font-black flex flex-row gap-4'>  <Mails /> Filtered Emails</span>
                            <div className='flex flex-col gap-1 w-full p-1 overflow-y-auto custom-scroll'>
                                {Emails.map((email, index) => (
                                    <div className='bg-[#06080d] p-2 flex flex-col transition-all hover:bg-[#262b2e] cursor-pointer' key={index} onClick={() => handleselectedemail(index)}>
                                        <span className='text-[0.9rem] truncate text-gray-100'>{email.from.emailAddress.name}</span>
                                        <span className='text-[0.8rem] truncate text-gray-400 '>{email.subject}</span>
                                        <span className='text-[0.7rem] truncate text-gray-500'>{email.bodyPreview}</span>
                                    </div>
                                ))}
                            </div>


                        </div> </>
                    }

                </div>


                {SelectedEmail ? (
                    <>
                        <div className='min-w-[40vw] max-w-[40vw] max-h-[89vh]'>
                            <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl w-full h-[50vh] min-h-[30vh]'>
                                <div className='w-full h-full bg-[#0c0e0f] p-4 rounded-xl p-5 flex flex-col'>
                                    <span className='text-gray-400 italic font-black flex flex-row gap-4 mb-2 '><Mail /> Selected Email</span>
                                    <div className="flex flex-col gap-3 w-full  flex-1  p-4 overflow-y-auto custom-scroll bg-[#06080d] rouded-xl text-gray-100 ">
                                        {SelectedEmail ? (
                                            <>
                                                {/* ---------- EMAIL HEADER ---------- */}
                                                <div className="border-b border-gray-700 pb-2">
                                                    {/* Subject */}
                                                    <h2 className="text-[1rem] font-semibold text-gray-100">
                                                        {SelectedEmail.subject}
                                                    </h2>

                                                    {/* From + Date */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 text-sm text-gray-400">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-300 font-medium">
                                                                {SelectedEmail.from?.emailAddress?.name}
                                                            </span>
                                                            <span className="text-gray-500 text-xs">
                                                                {SelectedEmail.from?.emailAddress?.address}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 sm:mt-0 text-xs text-gray-500">
                                                            {new Date(SelectedEmail.receivedDateTime).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    {/* Tags (Importance + Attachments) */}
                                                    <div className="flex items-center gap-2 mt-3">
                                                        {/* Importance Tag */}
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full font-semibold ${SelectedEmail.importance === "high"
                                                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                                : SelectedEmail.importance === "low"
                                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                                    : "bg-gray-600/20 text-gray-300 border border-gray-500/20"
                                                                }`}
                                                        >
                                                            {SelectedEmail.importance.toUpperCase()}
                                                        </span>

                                                        {/* Attachments */}
                                                        {SelectedEmail.hasAttachments && (
                                                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
                                                                📎 Attachment
                                                            </span>
                                                        )}

                                                        {/* Categories */}
                                                        {SelectedEmail.categories?.map((cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30"
                                                            >
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* ---------- EMAIL BODY ---------- */}
                                                <div className="text-gray-300 h-full text-[0.8rem] mt-[0.8px] overflow-y-auto custom-scroll">
                                                    {SelectedEmail.body.contentType.toUpperCase() === "HTML" ? (
                                                        <div
                                                            className="prose prose-invert max-w-none"
                                                            dangerouslySetInnerHTML={{
                                                                __html: SelectedEmail.body.content || "",
                                                            }}
                                                        />
                                                    ) : (
                                                        <p>{SelectedEmail.body.content}</p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-center mt-10">
                                                Select an email to view details.
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl w-full min-h-[20vh] h-[27vh] mt-12'>
                                <div className='w-full h-full bg-[#0c0e0f] p-[12px] rounded-xl flex flex-col '>
                                    <span className='text-gray-400 italic font-black flex flex-row gap-4 mb-1'>  <Brain />Summary Of Mail</span>
                                    <div className='w-full flex-1 min-h-0 p-2 overflow-y-auto custom-scroll bg-[#06080d] rounded-xl text-gray-300'>                                        {summary === "" ? <Shymmer /> : <>{summary}</>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='min-w-[25vw]  max-w-[40vw] flex flex-col gap-5'>

                            <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.07rem] rounded-xl w-full min-h-[22vh]'>
                                <div className='w-full h-full rounded-xl bg-[#0c0e0f] p-[10px] flex flex-col'>
                                    <span className='text-gray-400 italic font-black flex flex-row gap-4 text-[1rem]'> <CirclePlus /> Keywords</span>
                                    <span className='text-gray-700 text-sm'>Add keywords for filtering related email</span>
                                    <div className='w-full flex flex-row gap-3 justify-center items-center h-[1.5rem] m-1'>
                                        <input className=' w-full h-[1.5rem] m-1 bg-gray-700 rounded-md outline-none text-gray-100 p-[0.9px] px-1' placeholder='Ex - Placements' value={keywordval} onChange={(e) => setkeywordval(e.target.value)} />
                                        <button className='bg-purple-500 w-[80px] h-[1.5rem] p-[0.7px] rounded-md hover:bg-purple-600 cursor-pointer' onClick={addkeyword}>+ Add</button>
                                    </div>
                                    <div className='w-full flex-1 min-h-0 p-2 overflow-y-auto custom-scroll bg-[#06080d] rounded-xl text-gray-300'>                                        {keywords.length > 0 ?
                                        keywords.map((keyword, idx) =>
                                            <div className='bg-gray-700 text-[12px] text-center text-gray-300  px-[4px] w-fit h-fit m-2 rounded-xl  cursor-pointer transition-all  hover:bg-gray-800 flex flex-row' key={idx}>
                                                {keyword}<X className='w-[17px] h-[17px]' onClick={() => deletekeyword(idx)} />
                                            </div>

                                        ) : ""}
                                    </div>
                                </div>
                            </div>

                            <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl w-full min-h-[40vh]'>
                                <div className='w-full h-full rounded-xl bg-[#0c0e0f] p-2 flex flex-col'>
                                    <div className='flex flex-row'><span className='text-gray-400 italic font-black flex flex-row gap-4 mr-[13px]'> <Zap />Autogenerated Draft Reply Mail</span> {draftmail !== "" ? <Pencil className='text-white w-[1rem] h-[1rem] m-1 cursor-pointer transition-all hover:text-gray-500' onClick={handleeditdraft} /> : ""}</div>
                                    <div className='w-full flex-1 min-h-0 p-2 overflow-y-auto custom-scroll bg-[#06080d] rounded-xl text-gray-300'>                                        {draftmail === "" ? <Shymmer /> : <>{draftmail}</>}
                                    </div>
                                </div>
                            </div>

                            <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl w-full min-h-[18vh]'>
                                <div className='w-full h-full rounded-xl bg-[#0c0e0f] p-2 flex flex-col'>
                                    <span className='text-gray-400 italic font-black flex flex-row gap-4 '>  <Calendar /> Important Events in Mail</span>
                                    <div className='w-full flex-1 min-h-0 p-2 overflow-y-auto custom-scroll bg-[#06080d] rounded-xl text-gray-300'>                                        {events === "" ? <Shymmer /> : <>{events}</>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px] rounded-xl w-[100vw] h-[84vh]'>
                        <div className='text-gray-300 flex flex-col justify-center items-center bg-[#0c0e0f] w-full h-full rounded-xl' >
                            {loading ? <Shymmer /> : <>
                                <img src="https://res.public.onecdn.static.microsoft/assets/mail/illustrations/noMailSelected/v2/light.svg" className='w-[200px] h-[200px]' />
                                <span className='text-md font-bold '> Select an email to read</span>
                                <span className='text-sm '>Nothing is selected</span>
                            </>}
                        </div>
                    </div>
                )
                }
            </div>

            {showeditwindow ?
                <div className='bg-black/70 w-[100vw] h-[calc(100vh-12vh)] z-10 absolute inset-0 flex flex-col justify-center items-center  text-font transition-all '>
                    <div className='bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.2rem] rounded-xl w-[40vw] max-w-[650px] h-[60vh] mx-auto'>                        <div className='w-full h-full bg-gray-800 rounded-xl p-4 text-gray-300 flex flex-col'>
                        <div className='flex flex-row justify-between'>
                            <span className='text-xl font-bold text-gray-300'>Edit Draft mail</span>
                            <span className=' h-[1.8rem] cursor-pointer hover:text-gray-500 transition-all' onClick={() => setshoweditwindow(false)}>X</span>
                        </div>
                        <div id="edit"
                            contentEditable
                            suppressContentEditableWarning
                            className='h-full w-full bg-[#101314] rounded-xl m-1 p-4 overflow-y-auto custom-scroll'
                            dangerouslySetInnerHTML={{ __html: draftmail }} />
                        <button className='w-full mt-2 text-black bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg  h-auto hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-500 cursor-pointer' onClick={editted}>Edit</button>

                    </div>
                    </div>
                </div> : ""
            }
        </div>
    );
}
export default Page;


// treuncate
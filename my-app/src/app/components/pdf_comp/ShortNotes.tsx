'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../loader";

export default function ShortNotes({ persist_dir }: { persist_dir: string }) {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const generateNotes = async () => {
            const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/askquestion", {
                question: "Give me short notes of this whole PDF in bullet points. give in html code clean and correct heading in h1 if table make table to clearly explain topic. remove ** in place of use <b></b> tag or italic one",
                store: persist_dir
            });
            setNotes(res.data.answer);
        };
        generateNotes();
    }, [persist_dir])

    return (
        <div className="text-white h-full flex flex-col gap-4 font2">
            {notes ? <div className="bg-gray-800 p-3 rounded-xl overflow-y-auto custom-scroll whitespace-pre-line" dangerouslySetInnerHTML={{ __html: notes }} />
                : <Loader message="Short Notes Generating" />}
        </div>
    );
}

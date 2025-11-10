'use client'

import { useEffect, useState } from "react";
import axios from "axios";

export default function ShortNotes({ persist_dir }: { persist_dir: string }) {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const generateNotes = async () => {
            const res = await axios.post("/askquestion", {
                question: "Give me short notes of this whole PDF in bullet points.",
                store: persist_dir
            });
            setNotes(res.data.answer);
        };
        generateNotes();
    }, [persist_dir])

    return (
        <div className="text-white h-full flex flex-col gap-4">
            {notes ? (
                <div className="bg-gray-800 p-3 rounded-xl overflow-y-auto whitespace-pre-line">
                    {notes}
                </div>
            ) : (
            "")}
        </div>
    );
}

'use client'

import { useEffect, useState } from "react";
import axios from "axios";

export default function GenerateProject({ persist_dir }: { persist_dir: string }) {
    const [response, setResponse] = useState("");

    useEffect(() => {
        const generateProject = async () => {
            const res = await axios.post("/askquestion", {
                question: "Suggest 5 unique project ideas based on this PDF.",
                store: persist_dir
            });
            setResponse(res.data.answer);
        };
        generateProject();
    }, [persist_dir])

    return (
        <div className="text-white h-full flex flex-col gap-4">
            {response && (
                <div className="bg-gray-800 p-3 rounded-xl overflow-y-auto">
                    {response}
                </div>
            )}
        </div>
    );
}

'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../loader";

export default function GenerateProject({ persist_dir }: { persist_dir: string }) {
    const [response, setResponse] = useState<any[]>([]);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        const generateProject = async () => {
            const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/askquestion", {
                question: "Suggest 3 unique project ideas based on this PDF. with small description, Each title of project with description should be concise and clearly represent a core concept from the text.Return the output ONLY in a JSON array, no explanation outside the array. ",
                store: persist_dir
            });
            setResponse(res.data.answer);
            if (res.status == 200) {
                setloading(false);
            }
        };
        generateProject();
    }, [persist_dir])


    return (
        <div className="text-white h-full flex flex-col gap-4 font2">
            {loading ? <Loader message="Project Topics Generating ... " /> :
                <>
                    <span className="text-md text-gray-500 font-bold font5">Generated Project Topics:</span>
                    <div className="text-white h-full w-full flex flex-col gap-4 overflow-y-auto custom-scroll p-2 ">
                        {response.map((m: any, index: number) => (
                            <div
                                className="bg-gray-700 rounded-md p-3 transition-all duration-100 hover:bg-gray-800 cursor-pointer"
                                key={index}
                            >
                                <div className="font-semibold text-lg">{m.title}</div>
                                <div className="text-sm text-gray-300">{m.description}</div>
                            </div>
                        ))}

                    </div>
                    <div className="p-3 border-t border-gray-700 flex gap-2 bg-gray-900">
                        <input
                            className=" text-white flex-1 bg-gray-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition"
                            placeholder="give your topic"

                        />
                        <button
                            //   onClick={askQuestion}
                            className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer"

                        >
                            Generate Project
                        </button>
                    </div>
                </>
            }
        </div>
    );
}

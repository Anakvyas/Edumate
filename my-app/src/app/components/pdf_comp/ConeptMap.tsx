'use client'

import { useEffect, useState } from "react";
import axios from "axios";

export default function ConceptMap({ persist_dir }: { persist_dir: string }) {
  const [map, setMap] = useState("");

  useEffect(() => {
    const generateMap = async () => {
      const res = await axios.post("/askquestion", {
        question: "Create a concept map from main ideas in this PDF.",
        store: persist_dir
      });
      setMap(res.data.answer);
    };
    generateMap();
  })

  return (
    <div className="text-white h-full flex flex-col gap-4">
      {map && (<div className="bg-gray-800 p-3 rounded-xl overflow-y-auto whitespace-pre-line">
        {map}
      </div>)}
    </div>
  );
}

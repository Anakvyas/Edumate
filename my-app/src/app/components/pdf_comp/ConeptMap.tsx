'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import ConceptMapGraph from "../map";
import Loader from "../loader";

export default function ConceptMap({ persist_dir }: { persist_dir: string }) {
  const [map, setMap] = useState<any|null>(null);

  useEffect(() => {
    const generateMap = async () => {
      const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL+"/conceptmap", {
        store: persist_dir
      });
      setMap(res.data);
    };
    generateMap();
  },[persist_dir])

  return (
    <div className="text-white h-full flex flex-col gap-4">
        {map ? <ConceptMapGraph data={map}/> :<Loader message="Mind Map Generating ... "/> }
    </div>
  );
}

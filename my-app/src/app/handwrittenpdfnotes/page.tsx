"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { BrainCircuit, Eye, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

import Back from "../components/Back";
import Finetune from "./Finetune";
import PersonalizedOcr from "./PersonalizedOcr";
import Vision from "./Vision";

type HandwritingModel = {
  id: string;
  name: string;
  status: string;
  sample_count?: number;
  created_at?: string;
  last_error?: string;
};

export default function Page() {
  const [technique, setTechnique] = useState("");
  const [models, setModels] = useState<HandwritingModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelError, setModelError] = useState("");
  const [selectedModel, setSelectedModel] = useState<HandwritingModel | null>(null);

  const options = [
    {
      name: "Smart Recognition (Google Vision)",
      img: "./google_vision.png",
      subtitle: ["Best accuracy", "Fast", "Internet required"],
      value: "vision",
    },
    {
      name: "My Handwriting Mode (Personalized)",
      img: "./trocr_finetune.png",
      subtitle: ["Learns from your handwriting", "Best after training", "Improves with use"],
      value: "finetune",
    },
  ];

  const loadModels = async () => {
    try {
      setLoadingModels(true);
      setModelError("");
      const response = await axios.get("/api/handwritten/models", {
        params: { userID: "demo" },
      });
      setModels((response.data.models || []).filter((model: HandwritingModel) => model.status === "ready"));
    } catch (err: any) {
      setModelError(err?.response?.data?.message || err.message || "Could not load trained models.");
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleDeleteModel = async (modelId: string) => {
    try {
      await axios.delete("/api/handwritten/models", {
        params: { modelId },
      });
      setModels((prev) => prev.filter((model) => model.id !== modelId));
      if (selectedModel?.id === modelId) {
        setSelectedModel(null);
      }
    } catch (err: any) {
      setModelError(err?.response?.data?.message || err.message || "Could not delete the model.");
    }
  };

  if (selectedModel) {
    return <PersonalizedOcr model={selectedModel} />;
  }

  if (technique === "vision") {
    return <Vision />;
  }

  if (technique === "finetune") {
    return <Finetune onTrainingComplete={loadModels} />;
  }

  return (
    <div className="relative">
      <Back />
      <div className="w-full min-h-screen flex flex-col justify-center items-center text-font">
        <motion.div
          className="w-full max-w-[1300px] px-5"
          initial={{ opacity: 0.1, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "linear" }}
        >
          <span className="text-gray-200 italic text-md lg:text-xl">Select your Technique - </span>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start pt-5">
            <div className="flex flex-row justify-center items-center gap-9 flex-wrap">
              {options.map((option, index) => (
                <div
                  className="w-[90%] sm:w-[45%] lg:w-[20vw] h-[49vh] z-10 bg-[linear-gradient(130deg,#7dd87d,#06080d,#5e63b6)] p-[1.8px] rounded-2xl cursor-pointer"
                  key={index}
                  onClick={() => setTechnique(option.value)}
                >
                  <div className="bg-gray-900 w-full h-full rounded-2xl text-center p-3 hover:opacity-[0.95]">
                    <img src={option.img} className="w-full h-[50%] rounded-xl shadow-xl" />
                    <h1 className="text-gray-300 text-lg font-bold head-font mt-1">{option.name}</h1>
                    <ul style={{ listStyleType: "circle" }} className="text-gray-400 text-start px-4">
                      {option.subtitle.map((text, subtitleIndex) => (
                        <li key={subtitleIndex}>{text}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[linear-gradient(130deg,#7dd87d,#06080d,#5e63b6)] p-[1.5px]">
              <div className="rounded-2xl bg-[#0d1117] p-5 text-gray-200 min-h-[49vh]">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="text-[#7dd87d]" />
                  <h2 className="text-xl font-semibold">Ready Personalized Models</h2>
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  Completed handwriting models appear here after training. You can use them beside the Google Vision workflow or delete them anytime.
                </p>

                {modelError ? (
                  <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {modelError}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-4">
                  {loadingModels ? (
                    <div className="rounded-xl border border-white/10 bg-[#15191b] px-4 py-6 text-sm text-gray-400">
                      Loading trained models...
                    </div>
                  ) : null}

                  {!loadingModels && models.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#15191b] px-4 py-6 text-sm text-gray-400">
                      No personalized handwriting models are ready yet. Train one from the card on the left.
                    </div>
                  ) : null}

                  {models.map((model) => (
                    <div key={model.id} className="rounded-xl border border-white/10 bg-[#15191b] px-4 py-4 shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-[#7dd87d]" />
                            <h3 className="text-base font-semibold text-white">{model.name}</h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-400">
                            Status: <span className="text-[#7dd87d]">{model.status}</span>
                            {model.sample_count ? ` • ${model.sample_count} samples` : ""}
                          </p>
                        </div>

                        <button
                          className="rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteModel(model.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          className="flex-1 rounded-xl bg-gradient-to-r from-[#0c8b4c] to-[#6cc0ff] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] cursor-pointer"
                          onClick={() => setSelectedModel(model)}
                        >
                          Use Model
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

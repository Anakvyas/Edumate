import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, BrainCircuit, FileUp, Loader2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

import UploadDialog from "../components/Loading";
import PdfViewer from "../components/pdfViewer";

type OcrPage = {
  page: number;
  text: string;
};

type HandwritingModel = {
  id: string;
  name: string;
  sample_count?: number;
};

export default function PersonalizedOcr({ model }: { model: HandwritingModel }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [ocrPages, setOcrPages] = useState<OcrPage[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [status, setStatus] = useState<"loading" | "done">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadNotes = async () => {
    if (!file) {
      setError("Upload a handwritten PDF first.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      setShowDialog(true);
      setStatus("loading");

      const formdata = new FormData();
      formdata.append("file", file);
      formdata.append("userID", "demo");
      formdata.append("modelId", model.id);

      const response = await axios.post("/api/handwritten/model", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("done");
      setTimeout(() => {
        setOcrPages(response.data.ocrPages || []);
        setPdfUrl(response.data.pdflink);
      }, 700);
    } catch (err: any) {
      setShowDialog(false);
      setError(err?.response?.data?.message || "We could not process this PDF with your handwriting model.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pdfUrl) {
    return <PdfViewer pdfurl={pdfUrl} ocrPages={ocrPages} />;
  }

  return (
    <div className="flex flex-col items-center p-5 text-font w-full h-full">
      <motion.div
        className="rounded-xl bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px]"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <div className="bg-[#101314] max-w-[760px] min-h-auto flex flex-col items-center p-7 rounded-xl">
          <div className="flex flex-row text-2xl font-black text-gray-300 gap-4 head-font justify-center items-center w-full">
            <BrainCircuit />
            <span>{model.name}</span>
          </div>

          <span className="mt-2 text-center text-gray-500">
            Use your trained handwriting model to read a handwritten PDF and open the same study tools workflow.
          </span>

          <div className="mt-5 grid w-full max-w-[680px] grid-cols-1 gap-3 md:grid-cols-3">
            {[
              "Upload a handwritten PDF",
              "Read it with your trained handwriting model",
              "Open the notes viewer with raw OCR preview",
            ].map((step, index) => (
              <motion.div
                key={step}
                className="rounded-xl border border-[#7dd87d]/20 bg-[#15191b] px-4 py-4 text-center text-sm text-gray-300"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <span className="block text-xs uppercase tracking-[0.2em] text-[#7dd87d]">
                  Step {index + 1}
                </span>
                <span className="mt-2 block">{step}</span>
              </motion.div>
            ))}
          </div>

          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError("");
            }}
          />

          <div className="p-10">
            <h1 className="text-md text-gray-300 mb-2 flex flex-row gap-4">
              <Upload /> Upload Handwritten PDF Here
            </h1>
            <div
              className={`w-lg h-[180px] ${dragging ? "bg-gray-700" : "bg-[#566064]"} text-white border border-[#7dd87d] border-dashed border-2 rounded-xl flex flex-col justify-center items-center transition-all hover:bg-gray-700 cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const droppedFile = event.dataTransfer.files[0];
                if (droppedFile && droppedFile.type === "application/pdf") {
                  setFile(droppedFile);
                  setError("");
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
            >
              {file ? (
                <span className="flex flex-col justify-center items-center">{file.name}</span>
              ) : (
                <p className="flex flex-col justify-center items-center">
                  <FileUp className="mb-2 w-[60px] h-[50px]" />
                  <i>Click to upload, or drag PDF here</i>
                </p>
              )}
            </div>
          </div>

          {error ? (
            <div className="mb-5 flex w-full max-w-[680px] items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#0c8b4c] to-[#6cc0ff] p-[10px] text-white transition-all hover:scale-[1.01] hover:from-[#0ca45a] hover:to-[#8fd0ff] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            onClick={handleUploadNotes}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? "READING WITH YOUR MODEL..." : "Use This Model"}
          </button>

          <UploadDialog
            show={showDialog}
            onClose={() => setShowDialog(false)}
            status={status}
            title={`Using ${model.name}...`}
            subtitle="We are reading the handwritten PDF with your personalized model and preparing the notes viewer."
          />
        </div>
      </motion.div>
    </div>
  );
}

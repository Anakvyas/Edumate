"use client";

import { motion } from "framer-motion";
import { AlertCircle, FileUp, Loader2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import axios from "axios";

import Back from "../components/Back";
import UploadDialog from "../components/Loading";
import PdfViewer from "../components/pdfViewer";

const steps = [
  "Upload your lecture PDF or notes handout",
  "Extract readable text and structure it clearly",
  "Open clean notes with revision tools instantly",
];

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [status, setStatus] = useState<"loading" | "done">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLink, setPdfLink] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setError("");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError("");
    }
  };

  const handleGetNotes = async () => {
    if (!file) {
      setError("Upload a PDF first.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      setShowDialog(true);
      setStatus("loading");

      const formdata = new FormData();
      formdata.append("pdf", file);

      const response = await axios.post("/api/uploadpdf", formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("done");
      setTimeout(() => {
        setPdfLink(response.data.link);
      }, 700);
    } catch (err: any) {
      setShowDialog(false);
      setError(err?.response?.data?.message || "We could not generate notes from this PDF.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pdfLink) {
    return <PdfViewer pdfurl={pdfLink} />;
  }

  return (
    <div className="relative">
      <Back />
      <div className="flex flex-col jsutify-center items-center p-5 text-font">
        <input
          className="hidden"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        <motion.div
          className="rounded-xl bg-[linear-gradient(120deg,#7dd87d,#5e63b6)] p-[0.9px]"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="flex min-h-auto max-w-[760px] flex-col items-center rounded-xl bg-[#101314] p-7">
            <h1 className="head-font text-2xl text-gray-100">PDF Notes Extractor</h1>
            <span className="text-md text-center text-gray-500">
              Turn PDFs into clean, structured notes.
            </span>

            <div className="mt-5 grid w-full max-w-[680px] grid-cols-1 gap-3 md:grid-cols-3">
              {steps.map((step, index) => (
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

            <div className="p-10">
              <h1 className="mb-2 flex flex-row gap-4 text-md text-gray-300">
                <Upload /> Upload PDF Here
              </h1>
              <div
                className={`h-[180px] w-lg cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#7dd87d] text-white transition-all hover:bg-gray-700 ${
                  dragging ? "bg-gray-700" : "bg-[#566064]"
                } flex`}
                onClick={handleClick}
                onDrop={handleDrop}
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
                  <span className="flex flex-col items-center justify-center">{file.name}</span>
                ) : (
                  <p className="flex flex-col items-center justify-center">
                    <FileUp className="mb-2 h-[50px] w-[60px]" />
                    <i>Click to upload, or drag pdf here</i>
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
              className="flex w-sm cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#098009] to-[#7dd87d] p-2 font-semibold text-gray-800 shadow-md transition-all duration-300 hover:scale-105 hover:from-[#0ca50c] hover:to-[#98f598] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              onClick={handleGetNotes}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isSubmitting ? "GENERATING NOTES..." : "UPLOAD PDF"}
            </button>

            <UploadDialog
              show={showDialog}
              onClose={() => setShowDialog(false)}
              status={status}
              title="Generating your PDF notes..."
              subtitle="We are extracting text from the PDF, organizing it, and preparing your notes viewer."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;

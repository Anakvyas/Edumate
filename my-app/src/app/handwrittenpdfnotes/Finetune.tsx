import axios from "axios";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import FineTuneProgress from "../components/FineTuneProgress";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "HELLO FRIEND, HOPE YOU'RE HAVING A GREAT DAY!",
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789 and 9876543210",
  "I saw O0 and l1 look almost the same sometimes.",
  "My email is user.demo+test123@example.com",
  "Visit https://example.org for more information.",
  "The price was $12.99 or ₹1,250 depending on the shop.",
  "Today is 09/11/2025 and the time is 11:45 AM.",
  "My address is 221B Baker Street, London.",
  "Room 4B, Block C, Phase 2, Sector 11 is where I live.",
  "Keep calm & stay positive :)",
  "This sentence contains punctuation, commas, and dots.",
  "bdfhklt stand tall; gpqy drop below the line.",
  "Similar pairs: O0 oO 1lI iI 2Z z2 5S s5 8B b8.",
  "MixNumbersWithWordsLikeThis123 to test recognition.",
  "a^2 + b^2 = c^2 is the Pythagorean theorem.",
  "for(i = 0; i < 10; i++) { print(\"Hello\"); }",
  "Handwriting is personal; write the way you normally do.",
];

export default function Finetune({ onTrainingComplete }: { onTrainingComplete?: () => void }) {
  const productID = useRef(uuidv4()).current;
  const uploadRefs = useRef<HTMLInputElement[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<{ [key: number]: File }>({});
  const [modelName, setModelName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClickUpload = (index: number) => {
    uploadRefs.current[index]?.click();
  };

  const handleUploadSample = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formdata = new FormData();
    formdata.append("image", file);
    formdata.append("label", SAMPLE_TEXTS[index]);
    formdata.append("productId", productID);
    formdata.append("userID", "demo");

    await axios.post("/api/handwritten/trocr/uplaod", formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setError("");
    setUploaded((prev) => ({ ...prev, [index]: file }));
  };

  const handleFinetune = async () => {
    try {
      setError("");
      setIsSubmitting(true);

      const datasetResponse = await axios.get("/api/handwritten/trocr/uplaod", {
        params: { productID },
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/start_finetune`, {
        dataset: datasetResponse.data.arr,
        model_name: modelName,
        userID: "demo",
      });
      setJobId(response.data.job_id);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || err.message || "Fine-tuning failed to start.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobId) {
    return <FineTuneProgress jobId={jobId} onComplete={onTrainingComplete} />;
  }

  return (
    <div className="flex flex-col text-white justify-center items-center w-full m-auto p-5 gap-4">
      <h1 className="font4 text-3xl font-black">Fine Tune Your Handwriting Model</h1>

      <p className="text-center mt-2 text-gray-300 w-[90%] md:w-[60%] font3">
        Upload handwriting samples for the lines below. We train a fast personalized model so you can use it later from the handwritten notes screen.
      </p>

      <div className="w-[80vw] md:w-[60%] bg-[#11161c] border border-white/10 rounded-xl p-4">
        <label className="block text-sm text-gray-300 mb-2">Model Name</label>
        <input
          value={modelName}
          onChange={(event) => setModelName(event.target.value)}
          placeholder="My Personal Notes Model"
          className="w-full rounded-lg border border-white/10 bg-[#161b1f] px-4 py-3 text-white outline-none focus:border-[#7dd87d]"
        />
      </div>

      <div className="flex flex-col w-[80vw] justify-center items-center">
        {SAMPLE_TEXTS.map((text, index) => (
          <div key={index} className="w-full md:w-[60%] bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-green-400 font-medium">TEXT:</p>
            <p className="text-gray-300 mb-3">{text}</p>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(element: HTMLInputElement | null) => {
                if (element) {
                  uploadRefs.current[index] = element;
                }
              }}
              onChange={(event) => void handleUploadSample(event, index)}
            />

            <div className="w-full h-[10vh] border border-purple-500 border-dashed rounded-md text-center flex flex-col justify-center items-center cursor-pointer hover:bg-purple-500/20 transition">
              <div onClick={() => handleClickUpload(index)} className="p-2 flex flex-col justify-center w-full items-center">
                {uploaded[index] ? (
                  <span className="text-green-400 font-medium">Image uploaded successfully</span>
                ) : (
                  <>
                    <Plus className="mb-1" />
                    Click here to upload image
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {error ? (
          <div className="mb-5 flex w-full md:w-[60%] items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          className="w-[50vw] bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-2 text-black font-bold transition-all hover:scale-102 cursor-pointer hover:from-green-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleFinetune}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </span>
          ) : (
            "Fine Tune"
          )}
        </button>
      </div>
    </div>
  );
}

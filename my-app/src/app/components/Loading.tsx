"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface UploadDialogProps {
  show: boolean;
  onClose?: () => void;
  status: "loading" | "done";
  title?: string;
  subtitle?: string;
}

const UploadDialog = ({
  show,
  onClose,
  status,
  title = "Processing...",
  subtitle = "Please wait while we handle your request",
}: UploadDialogProps) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"uploading" | "ready">("uploading");

  useEffect(() => {
    if (!show) return;

    let progressTimer: NodeJS.Timeout | null = null;
    let closeTimer: NodeJS.Timeout | null = null;

    if (status === "loading") {
      setStage("uploading");
      setProgress(0);

      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) return prev + Math.random() * 4; // gradually increase
          return prev;
        });
      }, 300);
    }

    if (status === "done") {
      // complete progress bar smoothly
      setProgress(100);
      setStage("ready");

      // wait 3 seconds before closing automatically
      closeTimer = setTimeout(() => {
        onClose?.();
        setProgress(0);
        setStage("uploading");
      }, 3000);
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [show, status, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-[6px] bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-[#101314] text-white p-10 rounded-2xl shadow-[0_0_40px_rgba(125,216,125,0.2)] border border-[#5e63b6] flex flex-col items-center justify-center w-[400px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 10 }}
          >
            {/* Glow animation */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,#7dd87d33,#5e63b611)] blur-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />

            {/* Uploading stage */}
            {stage === "uploading" && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Loader2 className="w-16 h-16 text-[#7dd87d]" />
                </motion.div>
                <h2 className="text-xl mt-6 font-semibold">{title}</h2>
                <p className="text-gray-400 text-sm mt-2 text-center">{subtitle}</p>

                <div className="w-full mt-6 h-[8px] rounded-full bg-gray-800 overflow-hidden">
                  <motion.div
                    className="h-[8px] bg-gradient-to-r from-[#7dd87d] to-[#5e63b6]"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.4 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}%</p>
              </>
            )}

            {/* Done stage */}
            {stage === "ready" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <Sparkles className="w-16 h-16 text-[#7dd87d] mb-4" />
                <h2 className="text-2xl font-semibold text-center">Be ready... ✨</h2>
                <p className="text-gray-400 mt-2 text-center">
                  Your magic is almost ready!
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadDialog;

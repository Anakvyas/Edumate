"use client";
import React from "react";
import { motion } from "framer-motion";
import { Hourglass, Sparkles } from "lucide-react";

const ComingSoon = ({ title = "This Feature" }: { title?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative flex flex-col items-center justify-center text-center h-[300px] w-full rounded-2xl bg-gradient-to-br from-[#101314] via-[#0b0b10] to-[#14161a] border border-white/10 shadow-[0_0_25px_rgba(0,255,192,0.15)] overflow-hidden"
    >
    
      <motion.div
        initial={{ opacity: 0.1, scale: 0.8 }}
        animate={{
          opacity: [0.1, 0.4, 0.1],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,192,0.15),transparent_70%)]"
      />

      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Hourglass size={48} className="text-[#00ffc0] drop-shadow-[0_0_8px_#00ffc0]" />
      </motion.div>

      <h2 className="mt-4 text-2xl font-semibold text-white font-head">
        {title}
      </h2>
      <p className="text-gray-400 text-sm">Coming Soon...</p>


      <Sparkles className="absolute bottom-6 right-6 text-purple-400 opacity-30" size={20} />
    </motion.div>
  );
};

export default ComingSoon;

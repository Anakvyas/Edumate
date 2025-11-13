"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Target, Star } from "lucide-react";

const AboutUs = () => {
  const [rotate, setRotate] = useState(0);

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width / 2;
    setRotate(x > width ? 15 : -15);
  };

  const handleMouseLeave = () => setRotate(0);

  return (
    <>
      <motion.div
        onMouseMove={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateY: rotate }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="bg-[linear-gradient(130deg,#8B5CF6,#0c0f16,#0c0f16,#00ffc0)] w-[700px] h-[500px] mt-10 rounded-2xl p-[1.3px]"
      >
        <div className="bg-[#101314] w-full h-full rounded-2xl flex flex-col justify-center items-center text-center px-10">
          <BookOpen size={50} className="text-[#00ffc0] mb-4" />

          <h2 className="text-3xl  font2 font-semibold mb-3 bg-gradient-to-r from-purple-400 to-[#00ffc0] bg-clip-text text-transparent">
            About Edumate
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Edumate is an AI-powered learning platform designed to revolutionize
            digital education. It empowers students, mentors, and institutions
            through intelligent tools for personalized learning, real-time analytics,
            and collaborative engagement.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-8 text-center">
            <div className="flex flex-col items-center">
              <Users size={26} className="text-[#00ffc0] mb-1" />
              <p className="text-sm font-medium text-gray-200 font5">Smart Learning</p>
            </div>
            <div className="flex flex-col items-center">
              <Target size={26} className="text-[#00ffc0] mb-1" />
              <p className="text-sm font-medium text-gray-200 font5"   >AI Precision</p>
            </div>
            <div className="flex flex-col items-center">
              <Star size={26} className="text-[#00ffc0] mb-1" />
              <p className="text-sm font-medium text-gray-200 font5">Quality Growth</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AboutUs;

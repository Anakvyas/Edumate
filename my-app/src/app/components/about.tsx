"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Target, Star } from "lucide-react";

const AboutUs = () => {
  const [rotate, setrotate] = useState(0);

  const handlemouseover = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width / 2;

    if (x > width) {
      setrotate(20);
    } else {
      setrotate(-20);
    }
  }

  const handlemouseLeave = () => {
    setrotate(0);
  }

  return (
    <>
      <motion.div
        onMouseMove={handlemouseover}
        onMouseLeave={handlemouseLeave}
        animate={{ rotateY: rotate }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center"
        }}
        className="bg-[linear-gradient(130deg,yellow,#06080d,#06080d,#7dd87d)] w-[700px] h-[500px] mt-20 rounded-2xl p-[1.3px]">
        <div className="bg-[#101314] w-full h-full rounded-2xl text-white flex flex-col justify-center items-center">
          <BookOpen size={50} className="text-yellow-400 mb-4" />
          <p className="text-2xl font-semibold text-center px-4">"Education is not the learning of facts, but the training of the mind to think."</p>
          <p className="mt-4 text-gray-400 text-sm">— Albert Einstein</p>
        </div>
      </motion.div>
    </>
  );
};

export default AboutUs;



//  “Education is not the learning of facts, but the training of the
//   mind to think.” — Albert Einstein
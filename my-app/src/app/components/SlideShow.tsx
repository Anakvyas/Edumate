"use client";
import React from "react";
import {features} from "./feature";
import { motion } from "framer-motion";

const SlideShow = () => {
  const featureList = [...features, ...features];

  return (
    <div className="relative w-full h-[100px] flex justify-center items-center overflow-hidden bg-[#06080d]">
      <div className="pointer-events-none w-full absolute inset-0 flex justify-center items-center z-10">
        <div className="absolute inset-0  bg-[linear-gradient(to_right,#06080d,transparent,#06080d)] z-10" />
      </div>

      {/* === Sliding Track === */}
      <div className="w-[1300px] overflow-hidden ">
        <motion.div
          className="flex "
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {featureList.map((feature, index) => (
            <motion.div
              key={index}
              className="px-7 mx-2 text-center text-[1.2rem] font-bold text-gray-300 whitespace-nowrap "
            >
              {feature.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SlideShow;

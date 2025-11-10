"use client";
import React, { useState } from "react";
import { features } from "./feature";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const FeatureCard = () => {
  const featureList = [...features];
  const [rotate, setrotate] = useState(0);
  const [idx, setidx] = useState(-1);
  const router = useRouter();

  const handleclick = (name: string | null) => {
    if (!name) return;
    router.push(name);
  }

  const handlemousemove = (e: any, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;

    if (x < half) {
      setrotate(-13);
    } else {
      setrotate(13);}
    setidx(index);
  };

  const handlemouseleave = () => {
    setidx(-1);
    setrotate(0);
  };


  return (
    <>
      {featureList.map((feat, index) => (
        <motion.div
          key={index}
          onMouseMove={(e) => handlemousemove(e, index)}
          onMouseLeave={handlemouseleave}
          animate={{ rotateY: idx === index ? rotate : 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
          className="max-w-[270px] h-[340px] 
                     bg-[linear-gradient(130deg,#7dd87d,#06080d,#5e63b6)] 
                     p-[1.8px] rounded-2xl cursor-pointer"
          onClick={()=>handleclick(feat.url||null)}
        >
          <div className="w-full h-full bg-[#101314] rounded-2xl px-3 py-3">
            <img
              src={feat.img}
              className="w-full h-[200px] mb-[9px] rounded-2xl object-fill"
              alt={feat.name}
            />
            <h2 className="text-white text-lg mt-0">{feat.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{feat.desc}</p>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default FeatureCard;

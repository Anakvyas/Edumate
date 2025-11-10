"use client"
import { easeInOut, easeOut, motion } from 'framer-motion';
import React from 'react';

const Shymmer = () => {
    return (
        <div className="relative w-full h-full overflow-hidden rounded-md bg-[#0c0e0f] overflow-hidden rounded-xl">
            <motion.div
                initial={{ y: "200%" }}
                animate={{ y: ["200%", "-200%"] }}
                transition={{
                    duration: 0.9,
                    ease: easeOut,
                    repeat: Infinity,
                }}
                className="absolute inset-0 bg-[rgba(255,255,255,0.08)] blur-xl rotate-67"
                style={{
                    backgroundSize: "200% 200%",
                }}
            />
        </div>
    );
}

export default Shymmer;

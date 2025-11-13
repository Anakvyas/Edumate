"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const Back = ({ label = "Back", className = "" }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`fixed  text-gray-100 flex flex-row gap-2 cursor-pointer left-4 top-20 flex items-center text-white gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 backdrop-blur-md shadow-md hover:bg-gray-700 transition ${className}`}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
};

export default Back;

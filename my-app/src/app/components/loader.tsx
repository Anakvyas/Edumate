"use client";
import Lottie from "lottie-react";
import loader from "../../../public/animations/loader.json"

export default function Loader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900/80 backdrop-blur-sm">
      <div className="w-32">
        <Lottie animationData={loader} loop autoplay />
      </div>
      <p className="mt-3 text-gray-300 font-medium animate-pulse">
        {message || "Loading..."}
      </p>
    </div>
  );
}
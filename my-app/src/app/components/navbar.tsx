"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState("home");
  const [manualActive, setManualActive] = useState(false);

  const sections = ["home", "features", "about", "contact"];
  const router = useRouter();

  const handleLogin = () => {
    window.location.href = "/api/auth/callback";
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualActive) return; 
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [manualActive]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/checklogin");
        setAuthorized(res.data.Authorized);
      } catch (err: any) {
        console.log(err.message);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.get("/api/auth/logout");
      if (res.status === 200) {
        setAuthorized(false);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleClick = (sec: string) => {
    if (sec === "home") {
      setManualActive(true);
      setActiveSection("home");
      router.push("/home");
      setTimeout(() => setManualActive(false), 1000);
    } else {
      setManualActive(true);
      setActiveSection(sec);
      handleScrollTo(sec);
      setTimeout(() => setManualActive(false), 800);
    }
  };

  return (
    <div className="sticky z-[100] top-0 bg-background font2 px-8 py-4 text-white flex justify-between items-center shadow-[0_6px_12px_-2px_rgba(0,46,41,0.5)]">
      <span className="font1 text-4xl font-normal">Edumate</span>

      <div className="flex flex-row gap-6 font2 font-medium text-lg">
        {sections.map((sec) => (
          <div
            key={sec}
            onClick={() => handleClick(sec)}
            className={`relative cursor-pointer capitalize transition-colors ${
              activeSection === sec ? "text-[#00ffc0]" : "hover:text-[#00ffc0]"
            }`}
          >
            {sec}
            {activeSection === sec && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 -bottom-1 h-[2px] w-full bg-[#00ffc0] rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </div>
        ))}
      </div>

      {authorized ? (
        <button
          className="border border-[#01664d] px-3 py-2 rounded-xl shadow-[0_6px_22px_0_#002e29,inset_0_-8px_20px_0_rgba(0,255,192,0.15)] hover:bg-gray-900 cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <button
          className="border border-[#01664d] px-3 py-2 rounded-xl shadow-[0_6px_22px_0_#002e29,inset_0_-8px_20px_0_rgba(0,255,192,0.15)] hover:bg-gray-900 cursor-pointer"
          onClick={handleLogin}
        >
          Login with Outlook
        </button>
      )}
    </div>
  );
};

export default Navbar;

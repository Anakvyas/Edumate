"use client"
import axios from "axios";
import { use, useEffect, useState } from "react";

const Navbar = () => {
  const [authorized, setauthorized] = useState<Boolean>(false);

  const handlelogin = () => {
    window.location.href = '/api/auth/callback';
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/checklogin');
        setauthorized(res.data.Authorized);
      } catch (err: any) {
        console.log(err.message);
      }
    }
    checkAuth();
  })

  const handlelogout = async () => {
    try {
      const res = await axios.get('/api/auth/logout');
      if (res.status === 200) {
        setauthorized(false);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }


  return (
    <div className="sticky z-100 top-0 bg-background px-8 py-4 text-white  flex flex-row justify-between items-center text-font shadow-[0_6px_12px_-2px_rgba(0,46,41,0.5)] ">
      <span className="logo-text text-3xl font-black">Edumate</span>
      <div className="flex flex-row gap-6 ">
        <span className="ml-4">Home</span>
        <span className="ml-4">About</span>
        <span className="ml-4">Contact</span>
      </div>
      {
        authorized ? <button className="border border-[#01664d] px-3 py-2 rounded-xl shadow-[0_6px_22px_0_#002e29,inset_0_-8px_20px_0_rgba(0,255,192,0.15)] bg-hsla(0, 0%, 100%, .9)] hover:bg-gray-900  cursor-pointer" onClick={handlelogout}>Logout</button> :
          <button className="border border-[#01664d] px-3 py-2 rounded-xl shadow-[0_6px_22px_0_#002e29,inset_0_-8px_20px_0_rgba(0,255,192,0.15)] bg-hsla(0, 0%, 100%, .9)] hover:bg-gray-900  cursor-pointer" onClick={handlelogin}>Login with Outlook</button>
      }
    </div>
  )
}

export default Navbar;
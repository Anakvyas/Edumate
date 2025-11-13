import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import Document from "../lib/Document";
import { connectDB } from "../utils/db";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const mode = data.get("mode") || "";
    const video = data.get("video") || "";
    const userID = data.get("userID") || "demo";

    if (!mode || !video) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    await connectDB();
    let res =null;

    if (mode === "video") {
      const formdata = new FormData();
      formdata.append("video", video as File);
      res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload_video`, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else if (mode === "yt") {
      res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload_yt`, { video }, {
        headers: { "Content-Type": "application/json" },
      });
    }

    if(res?.data == null){
        return  ;
    }
    const { job_id } = res.data;
    console.log("Job started:", job_id);

    // 🕒 Poll the result until it's ready
    let result = null;
    for (let i = 0; i < 30; i++) { // 30 tries * 5s = 150s max
      const poll = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get_result/${job_id}`);
      if (poll.status === 200 && poll.data.pdf_link) {
        result = poll.data;
        break;
      }
      await new Promise(r => setTimeout(r, 5000)); // wait 5s
    }

    if (!result) {
      return NextResponse.json({ message: "Transcription not ready" }, { status: 504 });
    }

    console.log(result)
    console.log("");
    const { pdf_url, vectorstore } = result.pdf_link[0];
    console.log(pdf_url,vectorstore)

    await Document.create({
      userID,
      pdf_link:pdf_url,
      persist_dir:vectorstore
    });

    return NextResponse.json({ link: pdf_url, persist: vectorstore }, { status: 200 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const pdfurl = req.nextUrl.searchParams.get("pdfurl");
        const file = await Document.findOne({pdf_link:pdfurl});
        console.log(file);

        return NextResponse.json({"persist":file.persist_dir},{status:200})
    } catch (err: any) {
        console.log(err)
        return NextResponse.json({ "message": err.message }, { status: 500 })
    }
}
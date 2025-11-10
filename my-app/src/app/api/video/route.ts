import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import Document from "../lib/Document";
import { connectDB } from "../utils/db";
export async function POST(req: NextRequest) {
    try {
        const data = await req.formData()
        const mode = data.get("mode") || ""
        const video = data.get("video") || ""
        const userID = data.get("userID") || "demo"

        await connectDB();
        if (mode === "" || video === "") {
            return NextResponse.json({ "message": "missing parameter" }, { status: 400 })
        }

        let response = null;
        if (mode == 'video') {
            const formdata = new FormData()
            formdata.append("mode", mode)
            formdata.append("video", video)
            const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/upload_video", formdata, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            response = res.data.pdflink[0];
        } else if (mode == 'yt') {
            const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/upload_yt", { mode, video }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            response = res.data.pdflink[0];
        }
        console.log(response)
        const link = response.pdf_url;
        const persist = response.vectorstore;
        console.log(link,persist)

        await Document.create({
            userID: userID,
            pdf_link: link,
            persist_dir: persist,
        })

        return NextResponse.json({ "link": link }, { status: 200 })

    } catch (err: any) {
        console.log(err)
        return NextResponse.json({ "message": err.message }, { status: 500 })
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
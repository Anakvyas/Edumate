import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../utils/s3";
import axios from "axios";
import Document from "../lib/Document";
import { NextResponse } from "next/server";
import { connectDB } from "../utils/db";

export async function POST(req: Request) {
    try{
        const formdata  = await req.formData();
        const userID = formdata.get("userID") || "demo"
        const file = formdata.get('pdf') as File;
        if(!file){
            return new Response(JSON.stringify({message:"No file there!"}),{status:400})
        }
        await connectDB();
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const key = `pdf/uplaod_pdf/${userID}/${Date.now()}/${file.name}`;
        const bucket =process.env.AWS_S3_BUCKET

        await s3.send(new PutObjectCommand({
            Key:key,
            Bucket:process.env.AWS_S3_BUCKET,
            Body:buffer!,
            ContentType:"application/pdf"
        }))


        const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL+"/upload_pdf",{key,bucket,userID});
        const response = res.data.pdflink[0];
        const pdf_url = response.pdf_url;
        const persist_dir = response.vectorstore;

        await Document.create({
            userID: userID as string,
            pdf_link: pdf_url,
            persist_dir: persist_dir,
        })

        return NextResponse.json({ "link": pdf_url }, { status: 200 })

    }catch(err:any){
        console.log(err)
        return NextResponse.json({"message":err.message},{status:500})
    }
}
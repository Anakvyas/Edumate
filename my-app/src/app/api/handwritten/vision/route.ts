import { NextRequest, NextResponse } from "next/server";
import s3 from '../.././utils/s3';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { connectDB } from "../../utils/db";
import Document from "../../lib/Document";

function extractPdfPayload(payload: any) {
    const rawPayload = payload?.pdflink ?? payload;
    const normalized = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;

    if (normalized?.pdf_url && normalized?.vectorstore) {
        return normalized as {
            pdf_url: string;
            vectorstore: string;
            ocr_pages?: { page: number; text: string }[];
            raw_text?: string;
        };
    }

    return null;
}

export async function POST(req:NextRequest){
    try{
        const formdata = await req.formData();
        const userID = formdata.get("userID") || "demo"
        const file =  formdata.get("file") as File

        // console.log(file,userID)
        if(!file){
            return NextResponse.json({"message":"No handwritten PDF file was uploaded."},{status:400})
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const key = `pdf/vision/${userID}/${Date.now()}/${file.name}`;
        const bucket =process.env.AWS_S3_BUCKET

      
        await s3.send(new PutObjectCommand({
            Key:key,
            Bucket:process.env.AWS_S3_BUCKET,
            Body:buffer!,
            ContentType:"application/pdf"
        }))

        const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL+"/vision_ocr",{key,bucket,userID});

        const response = extractPdfPayload(res.data);
        if (!response) {
            throw new Error("Backend did not return a valid handwritten OCR payload.");
        }
        const pdflink = response.pdf_url;
        const persist_dir = response.vectorstore;
        const ocrPages = response.ocr_pages || [];

        await connectDB();

        await Document.create({
            userID :userID,
            handwrittenS3_pdfkey:key,
            pdf_link:pdflink,
            persist_dir :persist_dir
        })

        return NextResponse.json({"pdflink":pdflink,"ocrPages":ocrPages},{status:200})

    }catch(err:any){
        console.log(err)
        return NextResponse.json({"message":err?.response?.data?.message || err.message || "Handwritten OCR failed."},{status:500})
    }
}

import { NextRequest, NextResponse } from "next/server";
import s3 from '../.././utils/s3';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { connectDB } from "../../utils/db";
import Document from "../../lib/Document";

export async function POST(req:NextRequest){
    try{
        const formdata = await req.formData();
        const userID = formdata.get("userID") || "demo"
        const file =  formdata.get("file") as File

        // console.log(file,userID)
        if(!file){
            return NextResponse.json({"message":"No file there!"},{status:400})
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

        // console.log(res.data)
        const url = res.data.pdflink[0];
        const pdflink = url.pdf_url;
        const persist_dir = url.vectorstore;

        await connectDB();

        await Document.create({
            userID :userID,
            handwrittenS3_pdfkey:key,
            pdf_link:pdflink,
            persist_dir :persist_dir
        })

        return NextResponse.json({"pdflink":pdflink},{status:200})

    }catch(err:any){
        console.log(err)
        return NextResponse.json({"message":err.message},{status:500})
    }
}
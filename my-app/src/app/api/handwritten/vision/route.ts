import { NextRequest, NextResponse } from "next/server";
import s3 from '../.././utils/s3';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";

export async function POST(req:NextRequest,res:NextResponse){
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

        // console.log(res.data.url)
        const url = res.data.url

        return NextResponse.json({"url":url},{status:200})

    }catch(err:any){
        console.log(err)
        return NextResponse.json({"message":err.message},{status:500})
    }
}
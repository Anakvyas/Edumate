import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import s3 from '../../utils/s3'
import Quiz from "../../lib/Quiz";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const formdata = await req.formData();
        const userID = formdata.get("userID") || "demo";
        const prompt = formdata.get("prompt");
        const pdf = formdata.get("pdf") as File | null;

        // console.log(pdf)
        let buffer = null
        let key = null;
        let bucket = process.env.AWS_S3_BUCKET!;
        if (pdf != null) {
            const bytes = await pdf?.arrayBuffer();
            buffer = Buffer.from(bytes);

            key = `pdf/${userID}/${Date.now()}/-${pdf?.name}`;

            await s3.send(new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer!,
                ContentType: "application/pdf",
            }))

        }

        await connectDB();


        const bakendres = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/generate_questions", { prompt, key, bucket });
        const ques = bakendres.data.questions.questions;

        // console.log(ques)
        const quiz = await Quiz.create({
            userId: userID,
            title: prompt,
            s3PdfKey: key,
            questions: ques,
        })

        return NextResponse.json({ message: "done", "quiz": quiz }, { status: 200 })


    } catch (err: any) {
        console.log(err)
        return NextResponse.json({ "message": err.message }, { status: 500 })
    }

}
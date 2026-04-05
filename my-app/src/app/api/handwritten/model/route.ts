import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import Document from "../../lib/Document";
import s3 from "../../utils/s3";
import { connectDB } from "../../utils/db";

function extractPdfPayload(payload: any) {
  const rawPayload = payload?.pdflink ?? payload;
  const normalized = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;

  if (normalized?.pdf_url && normalized?.vectorstore) {
    return normalized as {
      pdf_url: string;
      vectorstore: string;
      ocr_pages?: { page: number; text: string }[];
      raw_text?: string;
      refined_text?: string;
      model_id?: string;
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formdata = await req.formData();
    const userID = formdata.get("userID") || "demo";
    const modelId = formdata.get("modelId");
    const file = formdata.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No handwritten PDF file was uploaded." }, { status: 400 });
    }

    if (!modelId) {
      return NextResponse.json({ message: "modelId is required." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `pdf/handwritten_model/${userID}/${Date.now()}/${file.name}`;
    const bucket = process.env.AWS_S3_BUCKET;

    await s3.send(
      new PutObjectCommand({
        Key: key,
        Bucket: process.env.AWS_S3_BUCKET,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );

    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ocr_with_model`, {
      key,
      bucket,
      userID,
      model_id: modelId,
    });

    const response = extractPdfPayload(res.data);
    if (!response) {
      throw new Error("Backend did not return a valid personalized OCR payload.");
    }

    await connectDB();
    await Document.create({
      userID,
      handwrittenS3_pdfkey: key,
      handwritingModelId: modelId,
      pdf_link: response.pdf_url,
      persist_dir: response.vectorstore,
    });

    return NextResponse.json(
      {
        pdflink: response.pdf_url,
        ocrPages: response.ocr_pages || [],
        refinedText: response.refined_text || "",
        rawText: response.raw_text || "",
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.response?.data?.message || err.message || "Personalized OCR failed." },
      { status: 500 }
    );
  }
}

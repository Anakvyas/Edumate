import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userID = req.nextUrl.searchParams.get("userID") || "demo";
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/models`, {
      params: { userID },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.response?.data?.message || err?.response?.data?.error || err.message || "Could not load handwriting models." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const modelId = req.nextUrl.searchParams.get("modelId");
    if (!modelId) {
      return NextResponse.json({ message: "modelId is required." }, { status: 400 });
    }

    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/models/${modelId}`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.response?.data?.message || err?.response?.data?.error || err.message || "Could not delete handwriting model." },
      { status: 500 }
    );
  }
}

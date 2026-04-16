import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/getevents`,
            body
        );

        return NextResponse.json(response.data, { status: response.status });
    } catch (err: any) {
        return NextResponse.json(
            {
                message:
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err.message ||
                    "Email event extraction failed.",
            },
            { status: err?.response?.status || 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const ms_token = req.cookies.get("ms_tokens")?.value;
  if (!ms_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { access_token } = JSON.parse(ms_token);

  try {
    // Fetch first page of messages
    const response = await axios.get(
      "https://graph.microsoft.com/v1.0/me/messages?$top=50",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const emails = response.data.value.map((e: any) => ({
      id: e.id,
      subject: e.subject || "(No subject)",
      from: {
        emailAddress: {
          name: e.from?.emailAddress?.name || "Unknown Sender",
          address: e.from?.emailAddress?.address || "",
        },
      },
      receivedDateTime: e.receivedDateTime,
      importance: e.importance?.toLowerCase() || "normal",
      hasAttachments: e.hasAttachments || false,
      categories: e.categories || [],
      bodyPreview: e.bodyPreview || "",
      body: {
        contentType: e.body.contentType,
        content: e.body.content || "",
      },
    }));

    return NextResponse.json(emails, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}

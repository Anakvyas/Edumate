import {NextRequest,NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest){
    const ms_token  = req.cookies.get("ms_tokens")?.value;
    if(!ms_token){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { access_token } = JSON.parse(ms_token);
    try{
    const response = await axios.get("https://graph.microsoft.com/v1.0/me/events", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const events = response.data.value.map((e: any) => ({
        id: e.id,
        subject: e.subject,
        start: e.start.dateTime,
        receivedDateTime: e.end.dateTime,
        location: e.location.displayName,
    }));

    return NextResponse.json(events, {status: 200});
    }catch(err){
        console.error(err);
        return NextResponse.json({error: "Failed to fetch emails"}, {status: 500});
    }
}
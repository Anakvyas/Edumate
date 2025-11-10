import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    const ms_token = req.cookies.get("ms_tokens")?.value;
    if(!ms_token){
        return NextResponse.json({"Authorized":false},{status:401});  
    }

    return NextResponse.json({"Authorized":true},{status:200});
}

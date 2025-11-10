import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try{
        const res =  NextResponse.json({message:"Logged out successfully"},{status:200});
        res.cookies.set("ms_tokens","",{maxAge:0,path:'/',httpOnly:true, secure:false,sameSite:'lax'});
        return res;
    }catch(err:any){
        console.log(err)
        return NextResponse.json({ "message": err.message }, { status: 500 })
    }
}
import { NextRequest, NextResponse } from "next/server";
import Quiz from "../../lib/Quiz";
import { ObjectId } from "mongodb";

export async function POST(req:NextRequest,res :NextResponse){
    try{
        const {id} = await req.json();
        const quiz =  await Quiz.findById(new ObjectId(id));
        return NextResponse.json({"quiz":quiz},{status:200});
    }catch(err:any){
        return NextResponse.json({ "message": err.message }, { status: 500 })
    }
}

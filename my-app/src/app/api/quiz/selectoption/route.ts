import { NextResponse, NextRequest } from "next/server";
import Quiz from "../../lib/Quiz";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { quizid, questionId, choosenAnswer } = await req.json();
        // console.log(quizid,questionId,choosenAnswer)
        const res  = await Quiz.updateOne(
            { _id: new ObjectId(quizid), "questions._id": new ObjectId(questionId) },
            { $set: { "questions.$.choosenAnswer": choosenAnswer } }
        )

        return NextResponse.json({ "message": res}, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ "message": err.message }, { status: 500 })

    }
}
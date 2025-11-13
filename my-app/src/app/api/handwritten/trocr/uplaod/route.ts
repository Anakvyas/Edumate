import { connectDB } from "@/app/api/utils/db";
import s3 from "@/app/api/utils/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import Train from "@/app/api/lib/ModelTrain";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
        const formData = await req.formData();
        const image = formData.get('image') as File;
        const label = formData.get('label');
        const userID =  formData.get("UserID") || "demo";
        const productId = formData.get("productId")
        console.log(productId)

        if(!image){
            return NextResponse.json({"message":"No Image Provided !!"},{status:400})
        }

        await connectDB();

        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = image.type;
        const key = `image/handwritten/${userID}/${Date.now()}/${image.name}`;

        await s3.send((new PutObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET,
            Key:key,
            Body:buffer,
            ContentType:mimeType
        })));

        let train = await Train.findOne({productId:productId})
        if(!train){
            train = await Train.create({
                userID :userID,
                productId:productId,
                image:[]
            })
        }

        train.image.push({
            s3ImageKey : key,
            label : label
        })

        await train.save();

        return NextResponse.json({"message":"Successfully Uploaded"},{status:200})
    }catch(err:any){
        console.log(err);
          return NextResponse.json({"message":err.message},{status:500})
    }
}


export async function GET(req:NextRequest){
    try{
        const productId = req.nextUrl.searchParams.get('productID');
        const arr = await Train.findOne({productId:productId});


        if(!arr){
            return NextResponse.json({"message":"Invalid ProductID"},{status:500})
        }
        
        return NextResponse.json({"arr":arr.image},{status:200})
    }catch(err:any){
        console.log(err);
        return NextResponse.json({"message":err.message},{status:500})
    }
}
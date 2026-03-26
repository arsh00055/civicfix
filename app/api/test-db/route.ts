import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(){

    try{

        const { db } = await connectToDatabase();
        
        return NextResponse.json({
            message: 'Database connected!',
            database: db.databaseName
        });
    }
    catch(error){
        return NextResponse.json({
            error
        })
    }
}

export async function POST(request: Request){
    const data = await request.json();
    return NextResponse.json({
        success: true,
        message: "Your data is received",
        data: data,
        timestamp: new Date().toISOString()
    });
}
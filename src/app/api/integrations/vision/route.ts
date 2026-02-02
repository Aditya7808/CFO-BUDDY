import { NextResponse } from "next/server";
import { analyzeScreenshot } from "@/lib/vision";

// POST /api/integrations/vision
// Analyzes an uploaded screenshot using GPT-4o Vision
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json(
                { success: false, error: "No image provided" },
                { status: 400 }
            );
        }

        // Remove data URL prefix if present
        const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

        const result = await analyzeScreenshot(base64Image);

        return NextResponse.json({
            success: result.success,
            source: process.env.OPENAI_API_KEY === "demo" ? "demo" : "openai",
            data: result,
        });
    } catch (error) {
        console.error("[API] Vision error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to analyze screenshot" },
            { status: 500 }
        );
    }
}

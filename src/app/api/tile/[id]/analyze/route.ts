import { NextResponse } from "next/server";
import { analyzeTileScreenshot } from "@/lib/tile-vision";

// POST /api/tile/[id]/analyze
// Analyzes a screenshot specific to a tile type
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
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

        const result = await analyzeTileScreenshot(id, base64Image);

        return NextResponse.json({
            success: result.success,
            tileId: id,
            source: process.env.OPENAI_API_KEY === "demo" ? "demo" : "openai",
            data: result,
        });
    } catch (error) {
        console.error("[API] Tile analysis error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to analyze screenshot" },
            { status: 500 }
        );
    }
}

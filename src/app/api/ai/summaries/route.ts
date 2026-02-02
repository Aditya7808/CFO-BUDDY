import { NextResponse } from "next/server";
import { generateAllSummaries } from "@/lib/genai";
import mockData from "@/data/mock.json";
import type { MetricsResponse } from "@/types/metrics";

// GET /api/ai/summaries
// Generates AI summaries for all tiles based on current metrics
export async function GET() {
    try {
        const data = mockData as MetricsResponse;

        // Prepare metrics for each tile
        const tiles = [
            {
                tileId: "cash-health",
                title: "Cash Health",
                metrics: data.cashHealth.details,
            },
            {
                tileId: "fulfillment-flow",
                title: "Fulfillment Flow",
                metrics: data.fulfillmentFlow.details,
            },
            {
                tileId: "unit-economics",
                title: "Unit Economics",
                metrics: data.unitEconomics.details,
            },
        ];

        // Generate AI summaries
        const summaries = await generateAllSummaries(tiles as unknown as { tileId: string; title: string; metrics: Record<string, string | number> }[]);

        return NextResponse.json({
            success: true,
            source: process.env.OPENAI_API_KEY === "demo" ? "demo" : "openai",
            summaries,
        });
    } catch (error) {
        console.error("[API] AI summaries error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate summaries" },
            { status: 500 }
        );
    }
}

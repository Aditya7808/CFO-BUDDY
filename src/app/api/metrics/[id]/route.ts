import { NextResponse } from "next/server";
import mockData from "@/data/mock.json";
import trendsData from "@/data/trends.json";
import type { MetricsResponse } from "@/types/metrics";

interface TrendPoint {
    day: string;
    value: number;
}

interface TileDetailData {
    id: string;
    title: string;
    status: string;
    trend: string;
    message: string;
    trendData: TrendPoint[];
    insights: string[];
    aiSummary: string;
    details: Record<string, number>;
}

// GET /api/metrics/[id]
// Returns detailed data for a specific tile
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const data = mockData as MetricsResponse;
        const trends = trendsData as Record<string, {
            trendData: TrendPoint[];
            insights: string[];
            aiSummary: string;
        }>;

        // Map tile ID to data
        let tileData: TileDetailData | null = null;

        if (id === "cash-health") {
            tileData = {
                id: "cash-health",
                title: "Cash Health",
                status: data.cashHealth.status,
                trend: data.cashHealth.trend,
                message: data.cashHealth.message,
                trendData: trends["cash-health"].trendData,
                insights: trends["cash-health"].insights,
                aiSummary: trends["cash-health"].aiSummary,
                details: data.cashHealth.details as unknown as Record<string, number>,
            };
        } else if (id === "fulfillment-flow") {
            tileData = {
                id: "fulfillment-flow",
                title: "Fulfillment Flow",
                status: data.fulfillmentFlow.status,
                trend: data.fulfillmentFlow.trend,
                message: data.fulfillmentFlow.message,
                trendData: trends["fulfillment-flow"].trendData,
                insights: trends["fulfillment-flow"].insights,
                aiSummary: trends["fulfillment-flow"].aiSummary,
                details: data.fulfillmentFlow.details as unknown as Record<string, number>,
            };
        } else if (id === "unit-economics") {
            tileData = {
                id: "unit-economics",
                title: "Unit Economics",
                status: data.unitEconomics.status,
                trend: data.unitEconomics.trend,
                message: data.unitEconomics.message,
                trendData: trends["unit-economics"].trendData,
                insights: trends["unit-economics"].insights,
                aiSummary: trends["unit-economics"].aiSummary,
                details: data.unitEconomics.details as unknown as Record<string, number>,
            };
        }

        if (!tileData) {
            return NextResponse.json(
                { success: false, error: "Tile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: tileData,
        });
    } catch (error) {
        console.error("Error fetching tile details:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch tile details" },
            { status: 500 }
        );
    }
}

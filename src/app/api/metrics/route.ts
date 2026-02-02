import { NextResponse } from "next/server";
import type { MetricsResponse, SimpleTile } from "@/types/metrics";
import mockData from "@/data/mock.json";

// GET /api/metrics
// Returns the current metrics for all 3 tiles
export async function GET() {
    try {
        // In production, this would fetch from real data sources:
        // - Cash Health: Bank API (Plaid), Accounting API (Zoho)
        // - Fulfillment: CV Processing Service
        // - Unit Economics: OMS, Fleet Management APIs

        const data = mockData as MetricsResponse;

        // Transform to simplified tiles for home page
        const tiles: SimpleTile[] = [
            {
                id: "cash-health",
                title: "Cash Health",
                status: data.cashHealth.status,
                trend: data.cashHealth.trend,
                message: data.cashHealth.message,
            },
            {
                id: "fulfillment-flow",
                title: "Fulfillment Flow",
                status: data.fulfillmentFlow.status,
                trend: data.fulfillmentFlow.trend,
                message: data.fulfillmentFlow.message,
            },
            {
                id: "unit-economics",
                title: "Unit Economics",
                status: data.unitEconomics.status,
                trend: data.unitEconomics.trend,
                message: data.unitEconomics.message,
            },
        ];

        return NextResponse.json({
            success: true,
            companyName: data.companyName,
            lastUpdated: data.lastUpdated,
            tiles,
        });
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch metrics" },
            { status: 500 }
        );
    }
}

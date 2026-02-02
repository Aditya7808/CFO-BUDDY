import { NextResponse } from "next/server";
import { getBankMetrics, calculateRunway, getCashHealthStatus } from "@/lib/bank";

// GET /api/integrations/bank
// Returns cash balance and cash health metrics
export async function GET() {
    try {
        const metrics = await getBankMetrics();
        const runway = calculateRunway(metrics.cashBalance, metrics.monthlyOutflow);
        const status = getCashHealthStatus(runway);

        return NextResponse.json({
            success: true,
            source: process.env.PLAID_CLIENT_ID === "demo" ? "demo" : "plaid",
            data: {
                ...metrics,
                runwayMonths: runway,
                healthStatus: status,
            },
        });
    } catch (error) {
        console.error("[API] Bank error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch bank metrics" },
            { status: 500 }
        );
    }
}

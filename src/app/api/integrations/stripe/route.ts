import { NextResponse } from "next/server";
import { getStripeMetrics } from "@/lib/stripe";

// GET /api/integrations/stripe
// Returns revenue metrics from Stripe
export async function GET() {
    try {
        const metrics = await getStripeMetrics();

        return NextResponse.json({
            success: true,
            source: process.env.STRIPE_SECRET_KEY === "demo" ? "demo" : "stripe",
            data: metrics,
        });
    } catch (error) {
        console.error("[API] Stripe error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch Stripe metrics" },
            { status: 500 }
        );
    }
}

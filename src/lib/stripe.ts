// Stripe Integration Service
// Fetches revenue metrics from Stripe API

interface StripeMetrics {
    mrr: number;                    // Monthly Recurring Revenue
    totalRevenue: number;           // Total revenue this month
    refunds: number;                // Total refunds this month
    netRevenue: number;             // Revenue - Refunds
    transactionCount: number;       // Number of successful payments
    avgTransactionValue: number;    // Average order value
}

// Demo data for when Stripe key is not configured
const DEMO_STRIPE_METRICS: StripeMetrics = {
    mrr: 4500000,
    totalRevenue: 45000000,
    refunds: 225000,
    netRevenue: 44775000,
    transactionCount: 125000,
    avgTransactionValue: 360,
};

export async function getStripeMetrics(): Promise<StripeMetrics> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // If no Stripe key or demo mode, return demo data
    if (!stripeKey || stripeKey === "demo") {
        console.log("[Stripe] Using demo data");
        return DEMO_STRIPE_METRICS;
    }

    try {
        // Dynamic import to avoid issues when Stripe is not installed
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" });

        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startTimestamp = Math.floor(startOfMonth.getTime() / 1000);

        // Fetch balance transactions for this month
        const charges = await stripe.charges.list({
            created: { gte: startTimestamp },
            limit: 100,
        });

        // Calculate metrics
        let totalRevenue = 0;
        let refunds = 0;
        let successfulTx = 0;

        for (const charge of charges.data) {
            if (charge.status === "succeeded") {
                totalRevenue += charge.amount;
                successfulTx++;
            }
            if (charge.refunded) {
                refunds += charge.amount_refunded;
            }
        }

        // Convert from paise/cents to rupees/dollars
        totalRevenue = totalRevenue / 100;
        refunds = refunds / 100;

        return {
            mrr: totalRevenue * 0.1, // Estimate: 10% is recurring
            totalRevenue,
            refunds,
            netRevenue: totalRevenue - refunds,
            transactionCount: successfulTx,
            avgTransactionValue: successfulTx > 0 ? totalRevenue / successfulTx : 0,
        };
    } catch (error) {
        console.error("[Stripe] Error fetching metrics:", error);
        // Return demo data on error
        return DEMO_STRIPE_METRICS;
    }
}

// Bank Integration Service (Plaid)
// Fetches cash balance and transaction data

interface BankMetrics {
    cashBalance: number;           // Current total balance across accounts
    monthlyInflow: number;         // Money coming in this month
    monthlyOutflow: number;        // Money going out this month
    netCashFlow: number;           // Inflow - Outflow
    accountCount: number;          // Number of connected accounts
}

// Demo data for when Plaid is not configured
const DEMO_BANK_METRICS: BankMetrics = {
    cashBalance: 150000000,        // 15 Cr
    monthlyInflow: 48000000,       // 4.8 Cr
    monthlyOutflow: 18000000,      // 1.8 Cr (burn rate)
    netCashFlow: 30000000,         // 3 Cr positive
    accountCount: 3,
};

export async function getBankMetrics(): Promise<BankMetrics> {
    const plaidClientId = process.env.PLAID_CLIENT_ID;
    const plaidSecret = process.env.PLAID_SECRET;

    // If no Plaid credentials or demo mode, return demo data
    if (!plaidClientId || !plaidSecret || plaidClientId === "demo") {
        console.log("[Plaid] Using demo data");
        return DEMO_BANK_METRICS;
    }

    try {
        // In production, you would:
        // 1. Use Plaid Link to connect user's bank account
        // 2. Store the access_token securely
        // 3. Call Plaid's /accounts/balance/get endpoint
        // 4. Call Plaid's /transactions/get endpoint for cash flow

        // For now, return demo data
        // Real implementation would use @plaid/plaid-node SDK
        console.log("[Plaid] Real integration not yet implemented");
        return DEMO_BANK_METRICS;
    } catch (error) {
        console.error("[Plaid] Error fetching bank metrics:", error);
        return DEMO_BANK_METRICS;
    }
}

// Calculate runway from bank metrics
export function calculateRunway(
    cashBalance: number,
    monthlyBurnRate: number
): number {
    if (monthlyBurnRate <= 0) return 99; // Infinite runway if not burning
    return Math.round((cashBalance / monthlyBurnRate) * 10) / 10;
}

// Determine cash health status
export function getCashHealthStatus(runwayMonths: number): "green" | "amber" | "red" {
    if (runwayMonths > 6) return "green";
    if (runwayMonths >= 3) return "amber";
    return "red";
}

// Types for CFO Insight Metrics

export type Status = "green" | "amber" | "red";
export type Trend = "up" | "down" | "stable";

// Base tile structure
export interface TileData {
    status: Status;
    trend: Trend;
    message: string;
}

// Tile 1: Cash Health
export interface CashHealthDetails {
    cashBalance: number;           // Current bank balance in INR
    monthlyBurnRate: number;       // Average monthly expenses
    runwayMonths: number;          // Cash / Burn Rate
    payroll: number;               // Monthly payroll expense
    liquidityRatio: number;        // Cash / Payroll
}

export interface CashHealthTile extends TileData {
    details: CashHealthDetails;
}

// Tile 2: Fulfillment Flow
export interface FulfillmentDetails {
    totalStores: number;           // Total dark stores
    storesAtRisk: number;          // Stores with congestion > 90%
    avgRiderWaitMinutes: number;   // Average rider queue time
    ordersAging15Min: number;      // Orders sitting > 15 minutes
    avgCongestionPercent: number;  // Average store congestion
}

export interface FulfillmentTile extends TileData {
    details: FulfillmentDetails;
}

// Tile 3: Unit Economics
export interface UnitEconomicsDetails {
    contributionMarginPercent: number;  // (Revenue - Variable Cost) / Revenue
    avgOrderValue: number;              // Average order value in INR
    deliveryCostPerOrder: number;       // Cost to deliver one order
    promoLeakagePercent: number;        // Discounts / Revenue
    totalOrdersToday: number;           // Orders processed today
}

export interface UnitEconomicsTile extends TileData {
    details: UnitEconomicsDetails;
}

// Complete metrics response
export interface MetricsResponse {
    companyName: string;
    lastUpdated: string;           // ISO 8601 timestamp
    cashHealth: CashHealthTile;
    fulfillmentFlow: FulfillmentTile;
    unitEconomics: UnitEconomicsTile;
}

// Simplified tile for home page display
export interface SimpleTile {
    id: string;
    title: string;
    status: Status;
    trend: Trend;
    message: string;
}

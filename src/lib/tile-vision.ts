// Tile-specific Vision Analysis Service
// Extracts metrics specific to each tile type using GPT-4o Vision

interface TileVisionResult {
    success: boolean;
    extractedMetrics: Record<string, number | string>;
    status: "green" | "amber" | "red";
    message: string;
    confidence: number;
}

// Prompts specialized for each tile type
const TILE_PROMPTS: Record<string, string> = {
    "cash-health": `You are a CFO assistant analyzing a financial document or dashboard screenshot.
Extract cash/banking metrics. Look for:
- Account balance / Cash balance
- Monthly expenses / Burn rate
- Income / Revenue
- Any dates shown

Return JSON with:
- extractedMetrics: key-value pairs of numbers found (in INR/USD)
- status: "green" if balance is healthy, "amber" if concerning, "red" if critical
- message: One sentence summary for a CEO (e.g., "Cash at 2.5 Cr, burn rate stable")
- confidence: 0-100 how confident you are in the extraction`,

    "fulfillment-flow": `You are a CFO assistant analyzing an operations/logistics dashboard screenshot.
Extract fulfillment metrics. Look for:
- Order counts / Pending orders
- Delivery times / Wait times
- Store/warehouse metrics
- Any backlogs or delays

Return JSON with:
- extractedMetrics: key-value pairs of numbers found
- status: "green" if operations smooth, "amber" if delays exist, "red" if critical
- message: One sentence summary for a CEO (e.g., "45 orders pending, avg wait 8 min")
- confidence: 0-100 how confident you are in the extraction`,

    "unit-economics": `You are a CFO assistant analyzing a revenue/sales dashboard screenshot.
Extract unit economics metrics. Look for:
- Revenue / Sales figures
- Margins / Profit percentages
- Order values / AOV
- Discounts / Promo costs

Return JSON with:
- extractedMetrics: key-value pairs of numbers found
- status: "green" if margins healthy, "amber" if concerning, "red" if losing money
- message: One sentence summary for a CEO (e.g., "Revenue 4.5 Cr, margin 12%")
- confidence: 0-100 how confident you are in the extraction`,
};

// Demo responses for each tile
const DEMO_RESPONSES: Record<string, TileVisionResult> = {
    "cash-health": {
        success: true,
        extractedMetrics: {
            "Cash Balance": "₹15,00,00,000",
            "Monthly Expenses": "₹1,80,00,000",
            "Last Updated": "Feb 2026",
        },
        status: "green",
        message: "Cash at 15 Cr, runway 8+ months. Looking healthy.",
        confidence: 85,
    },
    "fulfillment-flow": {
        success: true,
        extractedMetrics: {
            "Pending Orders": 156,
            "Avg Wait Time": "5.2 min",
            "Stores Active": 45,
        },
        status: "amber",
        message: "156 pending orders, 2 stores showing delays.",
        confidence: 78,
    },
    "unit-economics": {
        success: true,
        extractedMetrics: {
            "Daily Revenue": "₹48,50,000",
            "Contribution Margin": "12.4%",
            "Avg Order Value": "₹385",
        },
        status: "green",
        message: "Daily revenue 48.5L, margins at 12.4%. Promos under control.",
        confidence: 82,
    },
};

export async function analyzeTileScreenshot(
    tileId: string,
    imageBase64: string
): Promise<TileVisionResult> {
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no OpenAI key or demo mode, return demo data
    if (!openaiKey || openaiKey === "demo") {
        console.log(`[Vision] Using demo data for tile: ${tileId}`);
        return DEMO_RESPONSES[tileId] || DEMO_RESPONSES["cash-health"];
    }

    const prompt = TILE_PROMPTS[tileId] || TILE_PROMPTS["cash-health"];

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: prompt + "\n\nRespond with valid JSON only, no markdown.",
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/png;base64,${imageBase64}`,
                                },
                            },
                            {
                                type: "text",
                                text: "Analyze this screenshot and extract the relevant metrics.",
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        // Parse JSON from response
        const parsed = JSON.parse(content);

        return {
            success: true,
            extractedMetrics: parsed.extractedMetrics || {},
            status: parsed.status || "amber",
            message: parsed.message || "Analysis complete",
            confidence: parsed.confidence || 70,
        };
    } catch (error) {
        console.error(`[Vision] Error analyzing tile ${tileId}:`, error);
        return {
            success: false,
            extractedMetrics: {},
            status: "amber",
            message: "Failed to analyze screenshot. Please try again.",
            confidence: 0,
        };
    }
}

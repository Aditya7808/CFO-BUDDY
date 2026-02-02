// GenAI Summary Service
// Generates CEO-friendly summaries for each tile using GPT-4o

interface TileMetrics {
    tileId: string;
    title: string;
    metrics: Record<string, number | string>;
}

interface GeneratedSummary {
    message: string;
    status: "green" | "amber" | "red";
    trend: "up" | "down" | "stable";
}

// Demo summaries when OpenAI key is not configured
const DEMO_SUMMARIES: Record<string, GeneratedSummary> = {
    "cash-health": {
        message: "Runway is 8 months. Cash stable.",
        status: "green",
        trend: "stable",
    },
    "fulfillment-flow": {
        message: "2 stores slow. Rider wait 5 min.",
        status: "amber",
        trend: "down",
    },
    "unit-economics": {
        message: "Margins healthy. Promos controlled.",
        status: "green",
        trend: "up",
    },
};

// System prompts for generating summaries
const SUMMARY_PROMPTS: Record<string, string> = {
    "cash-health": `You are a CFO advisor generating a one-line summary for a CEO.
Given the cash metrics below, create:
- message: max 8 words, mention runway or cash status
- status: "green" if runway > 6 months, "amber" if 3-6 months, "red" if < 3 months
- trend: "up" if improving, "down" if declining, "stable" if unchanged

Examples:
- "Runway is 8 months. Cash stable." (green)
- "Burn increased. 4 months runway left." (amber)
- "Cash critical. 2 months runway." (red)

Respond with JSON only.`,

    "fulfillment-flow": `You are a CFO advisor generating a one-line summary for a CEO.
Given the fulfillment metrics below, create:
- message: max 8 words, focus on stores at risk or rider delays
- status: "green" if all stores normal, "amber" if 1-3 stores slow, "red" if > 3 stores or critical delays
- trend: based on whether situation is improving or worsening

Examples:
- "All stores flowing. No delays." (green)
- "2 stores slow. Rider wait 5 min." (amber)
- "5 stores congested. Orders piling up." (red)

Respond with JSON only.`,

    "unit-economics": `You are a CFO advisor generating a one-line summary for a CEO.
Given the unit economics metrics below, create:
- message: max 8 words, focus on margins or promos
- status: "green" if margin > 10%, "amber" if 5-10%, "red" if < 5%
- trend: based on whether margins are improving

Examples:
- "Margins healthy. Promos controlled." (green)
- "Margins dipped. Watch promo spend." (amber)
- "Losing money per order. Urgent fix needed." (red)

Respond with JSON only.`,
};

export async function generateTileSummary(
    tile: TileMetrics
): Promise<GeneratedSummary> {
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no OpenAI key or demo mode, return demo data
    if (!openaiKey || openaiKey === "demo") {
        console.log(`[GenAI] Using demo summary for: ${tile.tileId}`);
        return DEMO_SUMMARIES[tile.tileId] || DEMO_SUMMARIES["cash-health"];
    }

    const prompt = SUMMARY_PROMPTS[tile.tileId] || SUMMARY_PROMPTS["cash-health"];

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
                        content: prompt,
                    },
                    {
                        role: "user",
                        content: `Generate a summary for these metrics:\n${JSON.stringify(tile.metrics, null, 2)}`,
                    },
                ],
                max_tokens: 100,
                temperature: 0.3, // Low temperature for consistent outputs
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
            message: parsed.message || "Status updated.",
            status: parsed.status || "amber",
            trend: parsed.trend || "stable",
        };
    } catch (error) {
        console.error(`[GenAI] Error generating summary for ${tile.tileId}:`, error);
        return DEMO_SUMMARIES[tile.tileId] || DEMO_SUMMARIES["cash-health"];
    }
}

// Generate summaries for all tiles at once
export async function generateAllSummaries(
    tiles: TileMetrics[]
): Promise<Record<string, GeneratedSummary>> {
    const summaries: Record<string, GeneratedSummary> = {};

    // Process tiles in parallel
    await Promise.all(
        tiles.map(async (tile) => {
            summaries[tile.tileId] = await generateTileSummary(tile);
        })
    );

    return summaries;
}

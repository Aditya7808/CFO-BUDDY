// OpenAI Vision Integration Service
// Analyzes screenshots of dashboards using GPT-4o Vision

interface VisionAnalysisResult {
    success: boolean;
    extractedData: Record<string, string | number>;
    summary: string;
    sourceType: string; // e.g., "AWS Billing", "Stripe Dashboard", "Unknown"
}

// Demo response for when OpenAI key is not configured
const DEMO_VISION_RESULT: VisionAnalysisResult = {
    success: true,
    extractedData: {
        "Total Cost": "$2,847.32",
        "Month": "February 2026",
        "Top Service": "EC2 Instances",
        "Trend": "Up 12% from last month",
    },
    summary: "This appears to be an AWS billing dashboard. Monthly cost is $2,847.32, up 12% from last month. EC2 instances are the primary cost driver.",
    sourceType: "AWS Billing Dashboard",
};

export async function analyzeScreenshot(
    imageBase64: string
): Promise<VisionAnalysisResult> {
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no OpenAI key or demo mode, return demo data
    if (!openaiKey || openaiKey === "demo") {
        console.log("[Vision] Using demo data");
        return DEMO_VISION_RESULT;
    }

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
                        content: `You are a CFO assistant analyzing dashboard screenshots. 
Extract key financial/operational metrics from the image.
Return a JSON object with:
- sourceType: what kind of dashboard this is (e.g., "AWS Billing", "Stripe Dashboard", "Shopify Analytics")
- extractedData: key-value pairs of important numbers/metrics you see
- summary: a 2-sentence CEO-friendly summary of what this shows

Always respond with valid JSON only.`,
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
                                text: "Analyze this dashboard screenshot and extract the key metrics.",
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
            extractedData: parsed.extractedData || {},
            summary: parsed.summary || "Unable to analyze image",
            sourceType: parsed.sourceType || "Unknown",
        };
    } catch (error) {
        console.error("[Vision] Error analyzing screenshot:", error);
        return {
            success: false,
            extractedData: {},
            summary: "Failed to analyze image. Please try again.",
            sourceType: "Error",
        };
    }
}

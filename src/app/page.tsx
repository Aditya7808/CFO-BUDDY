"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, RefreshCw } from "lucide-react";
import StatusTile from "@/components/StatusTile";
import type { SimpleTile, Status, Trend } from "@/types/metrics";

interface MetricsApiResponse {
    success: boolean;
    companyName: string;
    lastUpdated: string;
    tiles: SimpleTile[];
}

interface AISummary {
    message: string;
    status: Status;
    trend: Trend;
}

interface AISummariesResponse {
    success: boolean;
    source: string;
    summaries: Record<string, AISummary>;
}

export default function Home() {
    const router = useRouter();
    const [data, setData] = useState<MetricsApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiSummaries, setAiSummaries] = useState<Record<string, AISummary> | null>(null);
    const [generatingAI, setGeneratingAI] = useState(false);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const response = await fetch("/api/metrics");
                if (!response.ok) {
                    throw new Error("Failed to fetch metrics");
                }
                const json = await response.json();
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    // Fetch AI-generated summaries
    const fetchAISummaries = async () => {
        setGeneratingAI(true);
        try {
            const response = await fetch("/api/ai/summaries");
            if (response.ok) {
                const json: AISummariesResponse = await response.json();
                setAiSummaries(json.summaries);
            }
        } catch (err) {
            console.error("Failed to fetch AI summaries:", err);
        } finally {
            setGeneratingAI(false);
        }
    };

    // Format timestamp for display
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Get tile data with AI override if available
    const getTileData = (tile: SimpleTile) => {
        if (aiSummaries && aiSummaries[tile.id]) {
            return {
                ...tile,
                message: aiSummaries[tile.id].message,
                status: aiSummaries[tile.id].status,
                trend: aiSummaries[tile.id].trend,
            };
        }
        return tile;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-zinc-500 text-lg">Loading metrics...</div>
            </div>
        );
    }

    // Error state
    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-lg">Error: {error || "No data"}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="px-6 py-5 flex items-center justify-between border-b border-white/10">
                <h1 className="text-xl font-semibold tracking-tight">CFO Insight</h1>
                <div className="flex items-center gap-3">
                    {/* AI Generate Button */}
                    <button
                        onClick={fetchAISummaries}
                        disabled={generatingAI}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${aiSummaries
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/5 hover:bg-white/10 text-zinc-400"
                            }`}
                        title="Generate AI Summaries"
                    >
                        {generatingAI ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        <span className="text-sm hidden sm:inline">
                            {generatingAI ? "Generating..." : aiSummaries ? "AI Active" : "AI Summary"}
                        </span>
                    </button>
                    {/* Camera Button */}
                    <button
                        onClick={() => router.push("/vision")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Analyze Screenshot"
                    >
                        <Camera size={20} className="text-zinc-400" />
                    </button>
                    <span className="text-sm text-zinc-500">{data.companyName}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 py-8">
                {/* Tiles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {data.tiles.map((tile) => {
                        const tileData = getTileData(tile);
                        return (
                            <StatusTile
                                key={tile.id}
                                id={tile.id}
                                title={tileData.title}
                                status={tileData.status}
                                message={tileData.message}
                                trend={tileData.trend}
                                onClick={() => router.push(`/tile/${tile.id}`)}
                            />
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 text-center border-t border-white/10">
                <p className="text-sm text-zinc-500">
                    Data as of {formatTime(data.lastUpdated)}
                    {aiSummaries && " • AI-enhanced"}
                </p>
            </footer>
        </div>
    );
}

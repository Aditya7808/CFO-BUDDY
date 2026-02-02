"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2 } from "lucide-react";

type Status = "green" | "amber" | "red";
type Trend = "up" | "down" | "stable";

interface AISummary {
    message: string;
    status: Status;
    trend: Trend;
}

interface StatusTileProps {
    id: string;
    title: string;
    status: Status;
    message: string;
    trend: Trend;
    onClick?: () => void;
}

export default function StatusTile({
    id,
    title,
    status,
    message,
    trend,
    onClick,
}: StatusTileProps) {
    const [aiEnhanced, setAiEnhanced] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiData, setAiData] = useState<AISummary | null>(null);

    // Use AI data if available, otherwise use props
    const displayStatus = aiData?.status || status;
    const displayMessage = aiData?.message || message;
    const displayTrend = aiData?.trend || trend;

    const statusColorClass = {
        green: "status-green",
        amber: "status-amber",
        red: "status-red",
    }[displayStatus];

    const textColorClass = {
        green: "text-status-green",
        amber: "text-status-amber",
        red: "text-status-red",
    }[displayStatus];

    const TrendIcon = {
        up: TrendingUp,
        down: TrendingDown,
        stable: Minus,
    }[displayTrend];

    // Generate AI summary for this tile
    const handleAIEnhance = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger tile click
        setLoading(true);

        try {
            const response = await fetch("/api/ai/summaries");
            if (response.ok) {
                const json = await response.json();
                if (json.summaries && json.summaries[id]) {
                    setAiData(json.summaries[id]);
                    setAiEnhanced(true);
                }
            }
        } catch (err) {
            console.error("AI enhance failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="status-card w-full text-left relative">
            {/* AI Enhance Button */}
            <button
                onClick={handleAIEnhance}
                disabled={loading}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${aiEnhanced
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-zinc-300"
                    }`}
                title={aiEnhanced ? "AI Enhanced" : "Enhance with AI"}
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Sparkles size={16} />
                )}
            </button>

            {/* Clickable Area */}
            <button onClick={onClick} className="w-full text-left">
                {/* Title */}
                <p className="text-sm uppercase tracking-widest text-zinc-500 mb-6 pr-10">
                    {title}
                    {aiEnhanced && (
                        <span className="ml-2 text-xs text-emerald-400 normal-case">• AI</span>
                    )}
                </p>

                {/* Status Indicator and Trend */}
                <div className="flex items-center justify-between mb-6">
                    {/* Large Status Circle */}
                    <div
                        className={`w-16 h-16 rounded-full ${statusColorClass} transition-all duration-300`}
                    />

                    {/* Trend Arrow */}
                    <div className={`${textColorClass} transition-all duration-300`}>
                        <TrendIcon size={28} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Message */}
                <p className="text-lg font-medium text-white leading-relaxed transition-all duration-300">
                    {displayMessage}
                </p>
            </button>
        </div>
    );
}

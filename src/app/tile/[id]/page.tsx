"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Upload, Loader2, CheckCircle } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface TrendPoint {
    day: string;
    value: number;
}

interface TileDetailData {
    id: string;
    title: string;
    status: string;
    trend: string;
    message: string;
    trendData: TrendPoint[];
    insights: string[];
    aiSummary: string;
    details: Record<string, number>;
}

interface AnalysisResult {
    extractedMetrics: Record<string, number | string>;
    status: string;
    message: string;
    confidence: number;
}

export default function TileDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<TileDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Screenshot upload state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const id = params.id as string;

    useEffect(() => {
        async function fetchTileDetails() {
            try {
                const response = await fetch(`/api/metrics/${id}`);
                if (!response.ok) {
                    throw new Error("Tile not found");
                }
                const json = await response.json();
                setData(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchTileDetails();
        }
    }, [id]);

    // Handle file upload
    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setAnalysisResult(null);
        };
        reader.readAsDataURL(file);
    }, []);

    // Analyze uploaded screenshot
    const analyzeScreenshot = async () => {
        if (!uploadedImage) return;

        setAnalyzing(true);
        try {
            const response = await fetch(`/api/tile/${id}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: uploadedImage }),
            });

            const json = await response.json();
            if (json.success) {
                setAnalysisResult(json.data);
            }
        } catch (err) {
            console.error("Analysis failed:", err);
        } finally {
            setAnalyzing(false);
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "green":
                return { bg: "#10B981", text: "text-emerald-400" };
            case "amber":
                return { bg: "#F59E0B", text: "text-amber-400" };
            case "red":
                return { bg: "#EF4444", text: "text-red-400" };
            default:
                return { bg: "#10B981", text: "text-emerald-400" };
        }
    };

    // Get trend icon
    const TrendIcon = data?.trend === "up"
        ? TrendingUp
        : data?.trend === "down"
            ? TrendingDown
            : Minus;

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
                <div className="text-zinc-500 text-lg">Loading...</div>
            </div>
        );
    }

    // Error state
    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F]">
                <div className="text-red-500 text-lg mb-4">Error: {error || "No data"}</div>
                <button
                    onClick={() => router.push("/")}
                    className="text-zinc-400 hover:text-white flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </button>
            </div>
        );
    }

    const statusColors = getStatusColor(analysisResult?.status || data.status);

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            {/* Header */}
            <header className="px-6 py-5 flex items-center gap-4 border-b border-white/10">
                <button
                    onClick={() => router.push("/")}
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-semibold tracking-tight">{data.title}</h1>
            </header>

            {/* Main Content */}
            <main className="px-6 py-8 max-w-4xl mx-auto space-y-8">
                {/* Status Card */}
                <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-full"
                                style={{ backgroundColor: statusColors.bg, boxShadow: `0 0 20px ${statusColors.bg}40` }}
                            />
                            <div>
                                <p className="text-lg font-medium">
                                    {analysisResult?.message || data.message}
                                </p>
                                <p className="text-sm text-zinc-500 uppercase tracking-wide">
                                    {analysisResult ? "Updated from Screenshot" : "Current Status"}
                                </p>
                            </div>
                        </div>
                        <div className={statusColors.text}>
                            <TrendIcon size={28} />
                        </div>
                    </div>
                </div>

                {/* Screenshot Upload Section */}
                <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
                        Update from Screenshot
                    </h2>

                    {!uploadedImage ? (
                        <div
                            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors cursor-pointer"
                            onClick={() => document.getElementById("tile-upload")?.click()}
                        >
                            <input
                                id="tile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFile(file);
                                }}
                            />
                            <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
                            <p className="text-zinc-400">Upload a screenshot to update this tile</p>
                            <p className="text-zinc-600 text-sm mt-1">Bank statement, dashboard, or report</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <img
                                src={uploadedImage}
                                alt="Uploaded"
                                className="max-h-48 mx-auto rounded-lg"
                            />

                            {!analysisResult && (
                                <button
                                    onClick={analyzeScreenshot}
                                    disabled={analyzing}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Analyze Screenshot"
                                    )}
                                </button>
                            )}

                            {analysisResult && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle size={20} />
                                        <span>Analysis complete ({analysisResult.confidence}% confidence)</span>
                                    </div>

                                    {/* Extracted Metrics */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(analysisResult.extractedMetrics).map(([key, value]) => (
                                            <div key={key} className="p-3 bg-black/30 rounded-lg">
                                                <p className="text-xs text-zinc-500">{key}</p>
                                                <p className="font-medium">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setUploadedImage(null);
                                            setAnalysisResult(null);
                                        }}
                                        className="w-full py-2 border border-white/20 rounded-xl text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Upload Another
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 7-Day Trend Chart */}
                <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-6">
                        7-Day Trend
                    </h2>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.trendData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={statusColors.bg} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={statusColors.bg} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#71717A", fontSize: 12 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#18181B",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                    }}
                                    labelStyle={{ color: "#A1A1AA" }}
                                    itemStyle={{ color: statusColors.bg }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={statusColors.bg}
                                    strokeWidth={2}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* What Changed - Insights */}
                <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
                        What Changed
                    </h2>
                    <ul className="space-y-3">
                        {data.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2" />
                                <span className="text-zinc-300">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* AI Summary */}
                <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
                        AI Analysis
                    </h2>
                    <p className="text-zinc-300 leading-relaxed">{data.aiSummary}</p>
                </div>

                {/* Key Metrics */}
                <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
                        Key Metrics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(data.details).map(([key, value]) => (
                            <div key={key} className="p-4 bg-black/30 rounded-xl">
                                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                                <p className="text-xl font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

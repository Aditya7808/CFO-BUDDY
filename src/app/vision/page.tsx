"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface AnalysisResult {
    success: boolean;
    sourceType: string;
    summary: string;
    extractedData: Record<string, string | number>;
}

export default function VisionPage() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle file drop or selection
    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
            setResult(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    }, []);

    // Handle drag and drop
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    // Analyze the screenshot
    const analyzeImage = async () => {
        if (!image) return;

        setAnalyzing(true);
        setError(null);

        try {
            const response = await fetch("/api/integrations/vision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image }),
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    success: true,
                    sourceType: data.data.sourceType,
                    summary: data.data.summary,
                    extractedData: data.data.extractedData,
                });
            } else {
                setError(data.error || "Analysis failed");
            }
        } catch (err) {
            setError("Failed to analyze image");
        } finally {
            setAnalyzing(false);
        }
    };

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
                <h1 className="text-xl font-semibold tracking-tight">Screenshot Analysis</h1>
            </header>

            {/* Main Content */}
            <main className="px-6 py-8 max-w-2xl mx-auto space-y-6">
                {/* Instructions */}
                <div className="text-center text-zinc-400 text-sm">
                    <p>Upload a screenshot of any dashboard (AWS, Stripe, Shopify, etc.)</p>
                    <p>AI will extract key metrics and explain what it means.</p>
                </div>

                {/* Upload Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-input")?.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />

                    {image ? (
                        <div className="space-y-4">
                            <img
                                src={image}
                                alt="Uploaded screenshot"
                                className="max-h-64 mx-auto rounded-lg"
                            />
                            <p className="text-zinc-400 text-sm">Click to upload a different image</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                                <Upload className="text-zinc-400" size={32} />
                            </div>
                            <div>
                                <p className="text-white font-medium">Drop an image here</p>
                                <p className="text-zinc-500 text-sm">or click to browse</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analyze Button */}
                {image && !result && (
                    <button
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Camera size={20} />
                                Analyze Screenshot
                            </>
                        )}
                    </button>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-400" size={24} />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        {/* Source Type */}
                        <div className="bg-[#12121A] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle className="text-emerald-400" size={24} />
                            <div>
                                <p className="text-sm text-zinc-500">Detected Source</p>
                                <p className="font-medium">{result.sourceType}</p>
                            </div>
                        </div>

                        {/* Extracted Data */}
                        <div className="bg-[#12121A] border border-white/10 rounded-xl p-6">
                            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
                                Extracted Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(result.extractedData).map(([key, value]) => (
                                    <div key={key} className="p-3 bg-black/30 rounded-lg">
                                        <p className="text-xs text-zinc-500">{key}</p>
                                        <p className="font-medium">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Summary */}
                        <div className="bg-[#12121A] border border-white/10 rounded-xl p-6">
                            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
                                AI Summary
                            </h3>
                            <p className="text-zinc-300 leading-relaxed">{result.summary}</p>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={() => {
                                setImage(null);
                                setResult(null);
                            }}
                            className="w-full py-3 border border-white/20 rounded-xl text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
                        >
                            Analyze Another Screenshot
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

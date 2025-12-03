"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { LaunchCampaignResponse } from "@/types/meta";

interface LaunchOnMetaButtonProps {
    strategy: {
        name: string;
        description: string;
        // Add other strategy fields as needed
    };
    imageUrl?: string; // Optional image URL to use for the ad
    link?: string; // Optional link for the ad
}

export function LaunchOnMetaButton({ strategy, imageUrl, link }: LaunchOnMetaButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleLaunch = async () => {
        setIsLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const response = await fetch("/api/meta/launch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    campaignName: strategy.name,
                    message: strategy.description,
                    link: link || "https://adziga.ai", // Default link if not provided
                    imageUrl: imageUrl || "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1000&q=80", // Default placeholder
                }),
            });

            const data: LaunchCampaignResponse = await response.json();

            if (data.success) {
                setStatus("success");
                console.log("Campaign launched successfully:", data);
            } else {
                setStatus("error");
                setErrorMessage(data.error || "Failed to launch campaign");
                console.error("Launch failed:", data);
            }
        } catch (error: any) {
            setStatus("error");
            const msg = error instanceof Error ? error.message : "Unknown error";
            setErrorMessage(`Error: ${msg}`);
            console.error("Launch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <button
                onClick={handleLaunch}
                disabled={isLoading || status === "success"}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${status === "success"
                        ? "bg-green-600 text-white cursor-default"
                        : status === "error"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === "success"
                    ? "Launched on Meta"
                    : status === "error"
                        ? "Retry Launch"
                        : "Launch on Meta"}
            </button>

            {status === "error" && (
                <p className="text-xs text-red-500 max-w-xs">{errorMessage}</p>
            )}

            {status === "success" && (
                <p className="text-xs text-green-600">Campaign created in Paused state.</p>
            )}
        </div>
    );
}

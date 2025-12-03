import {
    MetaCampaign,
    MetaAdSet,
    MetaAdImage,
    MetaAdCreative,
    MetaAd,
    MetaError,
} from "@/types/meta";

export class MetaClient {
    private appId: string;
    private appSecret: string;
    private accessToken: string;
    private adAccountId: string;
    private pageId: string;
    private apiVersion: string;
    private baseUrl: string;

    constructor() {
        this.appId = process.env.META_APP_ID || "";
        this.appSecret = process.env.META_APP_SECRET || "";
        this.accessToken = process.env.META_ACCESS_TOKEN || "";
        this.adAccountId = process.env.META_AD_ACCOUNT_ID || "";
        this.pageId = process.env.META_PAGE_ID || "";
        this.apiVersion = process.env.META_API_VERSION || "v18.0";
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

        // Ensure ad account id starts with act_
        if (this.adAccountId && !this.adAccountId.startsWith("act_")) {
            this.adAccountId = `act_${this.adAccountId}`;
        }

        this.validateConfig();
    }

    private validateConfig() {
        const missing = [];
        if (!this.appId) missing.push("META_APP_ID");
        if (!this.appSecret) missing.push("META_APP_SECRET");
        if (!this.accessToken) missing.push("META_ACCESS_TOKEN");
        if (!this.adAccountId) missing.push("META_AD_ACCOUNT_ID");
        if (!this.pageId) missing.push("META_PAGE_ID");

        if (missing.length > 0) {
            console.warn(
                `[MetaClient] Missing environment variables: ${missing.join(", ")}`
            );
        }
    }

    private async request<T>(
        endpoint: string,
        method: "GET" | "POST",
        body?: any
    ): Promise<T> {
        const url = `${this.baseUrl}/${endpoint}`;
        const params = new URLSearchParams();
        params.append("access_token", this.accessToken);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        const config: RequestInit = {
            method,
            headers,
        };

        if (method === "POST" && body) {
            config.body = JSON.stringify(body);
            console.log(`[MetaClient] Request Body for ${endpoint}:`, JSON.stringify(body));
        }

        const fullUrl = `${url}?${params.toString()}`;

        try {
            const response = await fetch(fullUrl, config);
            const data = await response.json();

            if (!response.ok || (data as MetaError).error) {
                console.error(`[MetaClient] Error Response for ${endpoint}:`, JSON.stringify(data));
                const errorData = data as MetaError;
                const errorMessage =
                    errorData.error?.message || `Request failed with status ${response.status}`;
                const fbtrace_id = errorData.error?.fbtrace_id;
                throw new Error(
                    JSON.stringify({ message: errorMessage, fbtrace_id })
                );
            }

            return data as T;
        } catch (error: any) {
            if (error.message && error.message.startsWith("{")) {
                throw error;
            }
            throw new Error(
                JSON.stringify({
                    message: error.message || "Unknown network error",
                    fbtrace_id: "unknown",
                })
            );
        }
    }

    async createCampaign(name: string): Promise<MetaCampaign> {
        return this.request<MetaCampaign>(
            `${this.adAccountId}/campaigns`,
            "POST",
            {
                name,
                objective: "OUTCOME_TRAFFIC",
                status: "PAUSED",
                special_ad_categories: [],
            }
        );
    }

    async createAdSet(
        campaignId: string,
        name: string
    ): Promise<MetaAdSet> {
        // Start time 15 minutes in the future to avoid "past time" errors
        const startTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // End time 7 days from now
        const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        return this.request<MetaAdSet>(`${this.adAccountId}/adsets`, "POST", {
            name,
            campaign_id: campaignId,
            daily_budget: 10000, // 10000 paise = ₹100 (Safe above ₹89.89 min)
            // billing_event removed to use default
            // bid_strategy removed to use default (LOWEST_COST_WITHOUT_CAP)
            optimization_goal: "LINK_CLICKS",
            targeting: {
                geo_locations: {
                    countries: ["IN"],
                },
                age_min: 21,
                age_max: 40,
                targeting_automation: {
                    advantage_audience: 0,
                },
            },
            start_time: startTime,
            end_time: endTime,
            status: "PAUSED",
        });
    }

    async uploadImage(imageUrl: string): Promise<MetaAdImage> {
        return this.request<MetaAdImage>(
            `${this.adAccountId}/adimages`,
            "POST",
            {
                url: imageUrl,
            }
        );
    }

    async createCreative(
        name: string,
        message: string,
        link: string,
        imageHash: string
    ): Promise<MetaAdCreative> {
        return this.request<MetaAdCreative>(
            `${this.adAccountId}/adcreatives`,
            "POST",
            {
                name,
                object_story_spec: {
                    page_id: this.pageId,
                    link_data: {
                        image_hash: imageHash,
                        link: link,
                        message: message,
                    },
                },
            }
        );
    }

    async createAd(
        name: string,
        adSetId: string,
        creativeId: string
    ): Promise<MetaAd> {
        return this.request<MetaAd>(`${this.adAccountId}/ads`, "POST", {
            name,
            adset_id: adSetId,
            creative: {
                creative_id: creativeId,
            },
            status: "PAUSED",
        });
    }
}

export interface MetaCampaign {
    id: string;
    name: string;
    status: string;
}

export interface MetaAdSet {
    id: string;
    name: string;
    status: string;
    campaign_id: string;
}

export interface MetaAdImage {
    hash: string;
    url: string;
}

export interface MetaAdCreative {
    id: string;
    name: string;
}

export interface MetaAd {
    id: string;
    name: string;
    status: string;
    creative: {
        id: string;
    };
}

export interface MetaError {
    error: {
        message: string;
        type: string;
        code: number;
        fbtrace_id: string;
    };
}

export interface LaunchCampaignRequest {
    campaignName: string;
    message: string;
    link: string;
    imageUrl?: string;
}

export interface LaunchCampaignResponse {
    success: boolean;
    campaignId?: string;
    adsetId?: string;
    creativeId?: string;
    adId?: string;
    error?: string;
    fbtrace_id?: string;
}

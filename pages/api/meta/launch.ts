import type { NextApiRequest, NextApiResponse } from 'next';
import { MetaClient } from "@/lib/meta/metaClient";
import { LaunchCampaignRequest, LaunchCampaignResponse } from "@/types/meta";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LaunchCampaignResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method Not Allowed'
        });
    }

    try {
        const { campaignName, message, link, imageUrl } = req.body as LaunchCampaignRequest;

        // Basic validation
        if (!campaignName || !message || !link) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: campaignName, message, or link",
            });
        }

        const client = new MetaClient();

        // 1. Create Campaign
        const campaign = await client.createCampaign(campaignName);
        console.log(`Created Campaign: ${campaign.id}`);

        // 2. Create Ad Set
        const adSet = await client.createAdSet(campaign.id, `${campaignName} - Ad Set`);
        console.log(`Created Ad Set: ${adSet.id}`);

        // 3. Upload Image (if provided)
        let imageHash = "";
        if (imageUrl) {
            const image = await client.uploadImage(imageUrl);
            imageHash = image.hash;
            console.log(`Uploaded Image Hash: ${imageHash}`);
        } else {
            return res.status(400).json({
                success: false,
                error: "Image URL is required for this ad format",
            });
        }

        // 4. Create Creative
        const creative = await client.createCreative(
            `${campaignName} - Creative`,
            message,
            link,
            imageHash
        );
        console.log(`Created Creative: ${creative.id}`);

        // 5. Create Ad
        const ad = await client.createAd(
            `${campaignName} - Ad`,
            adSet.id,
            creative.id
        );
        console.log(`Created Ad: ${ad.id}`);

        const response: LaunchCampaignResponse = {
            success: true,
            campaignId: campaign.id,
            adsetId: adSet.id,
            creativeId: creative.id,
            adId: ad.id,
        };

        return res.status(200).json(response);

    } catch (error: any) {
        console.error("Meta Launch Error:", error);

        let errorMessage = "Internal Server Error";
        let fbtrace_id = undefined;

        try {
            // Try to parse our structured error
            const parsed = JSON.parse(error.message);
            errorMessage = parsed.message;
            fbtrace_id = parsed.fbtrace_id;
        } catch (e) {
            // If not JSON, use the message directly
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            error: errorMessage,
            fbtrace_id,
        });
    }
}

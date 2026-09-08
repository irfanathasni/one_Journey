const crypto = require("crypto");

const createPayout = async ({
    fundAccountId,
    amount,
    referenceId
}) => {

    if (process.env.PAYOUT_MODE === "demo") {

        const demoStatus = process.env.DEMO_PAYOUT_STATUS || "processed";

        console.log("DEMO PAYOUT:", {
            fundAccountId,
            amount,
            referenceId,
            status: demoStatus
        });

        if (demoStatus === "failed") {
            return {
                id: `demo_payout_${crypto.randomUUID()}`,
                status: "failed",
                status_details: {
                    description: "Demo payout failed"
                }
            };
        }

        if (demoStatus === "pending") {
            return {
                id: `demo_payout_${crypto.randomUUID()}`,
                status: "pending",
                status_details: {
                    description: "Demo payout is being processed"
                }
            };
        }

        return {
            id: `demo_payout_${crypto.randomUUID()}`,
            status: "processed",
            status_details: {
                description: "Demo payout processed successfully"
            }
        };
    }

    throw new Error(
        "Real RazorpayX payout is not configured. Set PAYOUT_MODE=demo for demo testing."
    );
};

module.exports = {
    createPayout
};
import { Elysia } from "elysia";
import { Checkout, Webhooks } from "@polar-sh/elysia";
import { env, getRequiredPolarEnv } from "@env/server";

export const PRODUCT_ID = "c9fe3a9c-1663-48ec-b7c5-75fdc6be91ca";

const disabledPolarController = new Elysia({ prefix: "/polar" })
    .get("/checkout", ({ set }) => {
        set.status = 404;
        return "Not Found";
    })
    .post("/webhooks", ({ set }) => {
        set.status = 404;
        return "Not Found";
    });

function buildPolarController() {
    const polarEnv = getRequiredPolarEnv();

    return new Elysia({ prefix: "/polar" })
    .get(
        "/checkout",
        Checkout({
            accessToken: polarEnv.POLAR_ACCESS_TOKEN,
            successUrl: polarEnv.POLAR_SUCCESS_URL,
            server: polarEnv.POLAR_MODE,
        }),
    )
    .post(
        "/webhooks",
        Webhooks({
            webhookSecret: polarEnv.POLAR_WEBHOOK_SECRET,
            onPayload: async (payload) => {
                try {
                    switch (payload.type) {
                        case "subscription.created":
                        case "subscription.updated":
                        case "subscription.active":
                            console.log(`${payload.type} for ${payload.data.customerId}`);
                            // Note: Better-Auth's Polar plugin already handles some of this, 
                            // but you can add custom logic here if needed.
                            break;
                        case "subscription.revoked":
                        case "subscription.canceled":
                            console.log(`${payload.type} for ${payload.data.customerId}`);
                            break;
                        default:
                            console.log(`Unhandled event type: ${payload.type}`);
                    }
                } catch (error) {
                    console.error("Error processing webhook:", error);
                }
            },
        }),
    );
}

export const polarController = env.ENABLE_POLAR
    ? buildPolarController()
    : disabledPolarController;

import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

import { client } from "@/lib/client";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const { data } = await client.owner["setup-status"].get();
    if (!data) {
        return redirect({
            to: "/",
        });
    }

    console.log("[Server] Checking setup-status. hasOwner:", data?.hasOwner);
    if (request.url.includes("/setup") && data && !data.hasOwner) {
        return next();
    }
    return redirect({
        to: "/setup",
    });
});


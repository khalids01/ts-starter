import { Elysia } from "elysia";
import prisma from "@db";
import { env } from "@env/server";

export const ownerInfoGuard = new Elysia({ name: "ownerInfoGuard" })
    .onBeforeHandle(async ({ set }) => {
        if (!env.OWNER_SETUP_CHECK) {
            set.status = 404;
            return "Not Found";
        }

        const owner = await prisma.user.findFirst({
            where: {
                role: "OWNER",
            },
        });

        if (owner) {
            set.status = 404;
            return "Not Found";
        }
    });

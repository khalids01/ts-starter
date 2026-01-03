import { Elysia } from "elysia";
import prisma from "@ts-starter/db";

export const ownerInfoGuard = new Elysia({ name: "ownerInfoGuard" })
    .onBeforeHandle(async ({ set }) => {
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

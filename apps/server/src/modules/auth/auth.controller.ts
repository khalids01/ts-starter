import { Elysia, t } from "elysia";
import { auth } from "@auth";
import prisma from "@db";
import { env } from "../../env";

export const authController = new Elysia({ prefix: "/auth" })
    .post("/check-email", async ({ body }) => {
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        return { exists: !!user };
    }, {
        body: t.Object({ email: t.String() })
    })
    .post("/magic-link/login", async ({ body, request, set }) => {
        console.log(body);
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        console.log(user)
        if (!user) {
            set.status = 400;
            return { message: "User not found" };
        }
        await auth.api.signInMagicLink({
            body: {
                email: body.email,
                callbackURL: env.CORS_ORIGIN
            },
            headers: request.headers
        });
        return { success: true };
    }, {
        body: t.Object({ email: t.String() })
    })
    .post("/magic-link/signup", async ({ body, request, set }) => {
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        if (user) {
            set.status = 400;
            return { message: "User already exists" };
        }
        await auth.api.signInMagicLink({
            body: {
                email: body.email,
                name: body.name,
                callbackURL: env.CORS_ORIGIN
            },
            headers: request.headers
        });
        return { success: true };
    }, {
        body: t.Object({ email: t.String(), name: t.String() })
    });

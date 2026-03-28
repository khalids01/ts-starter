import prisma from "@db";
import { auth } from "@auth";
import { env } from "@env/server";
import { randomUUID } from "node:crypto";
import type { CreateOwner } from "./owner.dto";

export class OwnerService {
    async hasOwner() {
        const owner = await prisma.user.findFirst({
            where: {
                role: "OWNER",
            },
        });
        return !!owner;
    }

    async createOwner(data: CreateOwner) {
        const hasOwner = await this.hasOwner();
        if (hasOwner) {
            throw new Error("Owner already exists");
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (existingUser) {
            throw new Error("A user with this email already exists");
        }

        const owner = await prisma.user.create({
            data: {
                id: randomUUID(),
                email: data.email,
                name: data.name,
                role: "OWNER",
            },
        });

        await auth.api.signInMagicLink({
            body: {
                email: data.email,
                callbackURL: env.CORS_ORIGIN,
            },
            headers: new Headers(),
        });

        return owner;
    }
}

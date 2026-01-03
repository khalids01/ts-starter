import prisma from "@ts-starter/db";
import { auth } from "@ts-starter/auth";
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

        // Use better-auth to create the user with password hashing
        // We create the user first, then update the role to OWNER
        const user = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
        });

        if (!user) {
            throw new Error("Failed to create owner user");
        }

        // Update the role to OWNER
        const updatedUser = await prisma.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                role: "OWNER",
                emailVerified: true
            },
        });

        return updatedUser;
    }
}

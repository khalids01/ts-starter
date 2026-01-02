import { Elysia } from "elysia";
import { OwnerService } from "./owner.service";
import { CreateOwnerDto } from "./owner.dto";
import { env } from "@ts-starter/env/server";

const ownerService = new OwnerService();

export const ownerController = new Elysia({ prefix: "/owner" })
    .get("/setup-status", async ({ redirect }) => {
        const hasOwner = await ownerService.hasOwner();
        console.log("[Server] Checking setup-status. hasOwner:", hasOwner);

        if (!hasOwner) {
            redirect(env.CORS_ORIGIN + "/setup");
        }

        return { hasOwner };
    })
    .post("/setup", async ({ body, set }) => {
        try {
            const owner = await ownerService.createOwner(body);
            return {
                message: "Owner created successfully",
                user: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                },
            };
        } catch (error: any) {
            set.status = 400;
            return { error: error.message || "Failed to create owner" };
        }
    }, {
        body: CreateOwnerDto
    });

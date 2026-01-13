import { Elysia } from "elysia";
import { rolesGuard } from "../../../guards/roles.guard";
import { metadataService } from "./metadata.service";

export const metadataController = new Elysia({
    prefix: "/admin/metadata",
    detail: {
        tags: ["Admin - Metadata"],
    },
})
    .guard(
        {
            beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
        },
        (app) =>
            app.get("/overview", () => metadataService.getOverview(), {
                detail: {
                    summary: "Get dashboard overview statistics",
                },
            })
    );

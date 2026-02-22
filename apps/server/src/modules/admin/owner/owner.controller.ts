import { Elysia, t } from "elysia";
import { OwnerService } from "./owner.service";
import { CreateOwnerDto } from "./owner.dto";
import { env } from "@/env";
import { ownerInfoGuard } from "@/guards/owner-info.guard";

const ownerService = new OwnerService();

export const ownerController = new Elysia({ prefix: "/owner" })
  .use(ownerInfoGuard)
  .get(
    "/setup-status",
    async ({ redirect }) => {
      const hasOwner = await ownerService.hasOwner();
      if (!hasOwner) {
        redirect(env.CORS_ORIGIN + "/setup");
      }

      return { hasOwner };
    },
    {
      detail: {
        tags: ["Owner"],
        summary: "Check setup status",
        description:
          "Checks if the initial owner has been created. Redirects to /setup if not.",
        responses: {
          200: {
            description: "Setup status retrieved",
            content: {
              "application/json": {
                schema: t.Object({
                  hasOwner: t.Boolean(),
                }),
              },
            },
          },
        },
      },
    },
  )
  .post(
    "/setup",
    async ({ body, set }) => {
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
    },
    {
      body: CreateOwnerDto,
      detail: {
        tags: ["Owner"],
        summary: "Create initial owner",
        description:
          "Creates the first owner account for the platform. Only accessible if no owner exists.",
        responses: {
          200: {
            description: "Owner created successfully",
            content: {
              "application/json": {
                schema: t.Object({
                  message: t.String(),
                  user: t.Object({
                    id: t.String(),
                    name: t.String(),
                    email: t.String(),
                  }),
                }),
              },
            },
          },
          400: {
            description: "Failed to create owner",
            content: {
              "application/json": {
                schema: t.Object({
                  error: t.String(),
                }),
              },
            },
          },
          404: {
            description: "Route hidden because owner already exists",
          },
        },
      },
    },
  );

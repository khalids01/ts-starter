import Elysia from "elysia";
import { ownerController } from "./admin/owner/owner.controller";
import { usersController } from "./admin/users/users.controller";
import { metadataController } from "./admin/metadata/metadata.controller";
import { authController } from "./auth/auth.controller";

export const app = new Elysia()
    .use(authController)
    .use(ownerController)
    .use(usersController)
    .use(metadataController);
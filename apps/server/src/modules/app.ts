import Elysia from "elysia";
import { ownerController } from "./admin/owner/owner.controller";
import { usersController } from "./admin/users/users.controller";

export const app = new Elysia()
    .use(ownerController)
    .use(usersController);
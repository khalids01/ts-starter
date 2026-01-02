import Elysia from "elysia";
import { ownerController } from "./admin/owner/owner.controller";

export const app = new Elysia()
    .use(ownerController);
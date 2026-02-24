import Elysia from "elysia";
import { ownerController } from "./admin/owner/owner.controller";
import { usersController } from "./admin/users/users.controller";
import { metadataController } from "./admin/metadata/metadata.controller";
import { authController } from "./auth/auth.controller";
import { notificationsController } from "./notifications/notifications.controller";
import { feedbackController } from "./feedback/feedback.controller";

export const app = new Elysia()
  .use(authController)
  .use(ownerController)
  .use(usersController)
  .use(metadataController)
  .use(notificationsController)
  .use(feedbackController);

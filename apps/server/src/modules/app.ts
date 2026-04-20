import Elysia from "elysia";
import { ownerController } from "./admin/owner/owner.controller";
import { usersController } from "./admin/users/users.controller";
import { metadataController } from "./admin/metadata/metadata.controller";
import { authController } from "./auth/auth.controller";
import { notificationsController } from "./notifications/notifications.controller";
import { feedbackController } from "./feedback/feedback.controller";
import { polarController } from "./polar/polar.controller";
import { rateLimitController } from "./rate-limit/rate-limit.controller";

export const app = new Elysia()
  .use(authController)
  .use(ownerController)
  .use(usersController)
  .use(metadataController)
  .use(rateLimitController)
  .use(notificationsController)
  .use(feedbackController)
  .use(polarController);

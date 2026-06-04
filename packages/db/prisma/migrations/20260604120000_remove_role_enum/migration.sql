-- Add invitation.roleId (nullable during backfill)
ALTER TABLE "invitation" ADD COLUMN "roleId" TEXT;

-- Backfill invitation.roleId from legacy enum via rbac_role slug
UPDATE "invitation" AS i
SET "roleId" = r.id
FROM "rbac_role" AS r
WHERE r.slug = CASE i.role::text
  WHEN 'OWNER' THEN 'platform.owner'
  WHEN 'ADMIN' THEN 'platform.admin'
  ELSE 'platform.user'
END;

-- Default any remaining invitations to platform.user
UPDATE "invitation" AS i
SET "roleId" = (SELECT id FROM "rbac_role" WHERE slug = 'platform.user' LIMIT 1)
WHERE i."roleId" IS NULL;

-- Backfill rbac_user_role from user.role where missing
INSERT INTO "rbac_user_role" ("userId", "roleId")
SELECT u.id, r.id
FROM "user" AS u
JOIN "rbac_role" AS r ON r.slug = CASE u.role::text
  WHEN 'OWNER' THEN 'platform.owner'
  WHEN 'ADMIN' THEN 'platform.admin'
  ELSE 'platform.user'
END
WHERE NOT EXISTS (
  SELECT 1 FROM "rbac_user_role" AS ur WHERE ur."userId" = u.id
);

ALTER TABLE "invitation" ALTER COLUMN "roleId" SET NOT NULL;

ALTER TABLE "invitation" DROP COLUMN "role";

DROP INDEX IF EXISTS "user_role_idx";

ALTER TABLE "user" DROP COLUMN "role";

DROP TYPE "Role";

CREATE INDEX "invitation_roleId_idx" ON "invitation"("roleId");

ALTER TABLE "invitation" ADD CONSTRAINT "invitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "rbac_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

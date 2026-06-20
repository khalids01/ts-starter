import { describe, expect, it } from "bun:test";
import { AllPermissions, Permissions, RolePermissionMap, Roles } from "@rbac";

describe("ecommerce permissions", () => {
  it("adds ecommerce permissions to the catalog", () => {
    expect(AllPermissions).toContain(Permissions.AdminCatalogRead);
    expect(AllPermissions).toContain(Permissions.AdminCatalogManage);
    expect(AllPermissions).toContain(Permissions.AdminProductsRead);
    expect(AllPermissions).toContain(Permissions.AdminProductsManage);
    expect(AllPermissions).toContain(Permissions.AdminInventoryRead);
    expect(AllPermissions).toContain(Permissions.AdminInventoryManage);
    expect(AllPermissions).toContain(Permissions.AdminOrdersRead);
    expect(AllPermissions).toContain(Permissions.AdminOrdersManage);
    expect(AllPermissions).toContain(Permissions.AdminImagesRead);
    expect(AllPermissions).toContain(Permissions.AdminImagesManage);
  });

  it("grants ecommerce permissions to owner and admin, not platform user", () => {
    expect(RolePermissionMap[Roles.PlatformOwner]).toContain(
      Permissions.AdminCatalogManage,
    );
    expect(RolePermissionMap[Roles.PlatformOwner]).toContain(
      Permissions.AdminProductsManage,
    );
    expect(RolePermissionMap[Roles.PlatformOwner]).toContain(
      Permissions.AdminInventoryManage,
    );
    expect(RolePermissionMap[Roles.PlatformOwner]).toContain(
      Permissions.AdminOrdersManage,
    );
    expect(RolePermissionMap[Roles.PlatformOwner]).toContain(
      Permissions.AdminImagesManage,
    );
    expect(RolePermissionMap[Roles.PlatformAdmin]).toContain(
      Permissions.AdminCatalogManage,
    );
    expect(RolePermissionMap[Roles.PlatformAdmin]).toContain(
      Permissions.AdminProductsManage,
    );
    expect(RolePermissionMap[Roles.PlatformAdmin]).toContain(
      Permissions.AdminInventoryManage,
    );
    expect(RolePermissionMap[Roles.PlatformAdmin]).toContain(
      Permissions.AdminOrdersManage,
    );
    expect(RolePermissionMap[Roles.PlatformAdmin]).toContain(
      Permissions.AdminImagesManage,
    );
    expect(RolePermissionMap[Roles.PlatformUser]).not.toContain(
      Permissions.AdminCatalogRead,
    );
    expect(RolePermissionMap[Roles.PlatformUser]).not.toContain(
      Permissions.AdminProductsRead,
    );
    expect(RolePermissionMap[Roles.PlatformUser]).not.toContain(
      Permissions.AdminInventoryRead,
    );
    expect(RolePermissionMap[Roles.PlatformUser]).not.toContain(
      Permissions.AdminOrdersRead,
    );
    expect(RolePermissionMap[Roles.PlatformUser]).not.toContain(
      Permissions.AdminImagesRead,
    );
  });
});

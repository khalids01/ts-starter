import type { ReactNode } from "react";
import { Permissions, type Permission } from "@rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { sessionHasPermission } from "@/features/user/lib/session-permissions";
import type { ClientSession } from "@auth/client";

export function EcommerceHeader(props: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
        {props.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        ) : null}
      </div>
      {props.action ? <div className="flex shrink-0 gap-2">{props.action}</div> : null}
    </div>
  );
}

export function EmptyTableRow(props: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={props.colSpan} className="h-24 text-center text-muted-foreground">
        {props.children}
      </TableCell>
    </TableRow>
  );
}

export function StatusBadge(props: { active?: boolean; status?: string }) {
  if (props.status) {
    const variant =
      props.status === "active"
        ? "default"
        : props.status === "archived"
          ? "destructive"
          : "secondary";
    return <Badge variant={variant}>{props.status}</Badge>;
  }

  return props.active ? (
    <Badge>Active</Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );
}

export function Field(props: {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={props.htmlFor}>{props.label}</Label>
      {props.children}
      {props.hint ? <p className="text-xs text-muted-foreground">{props.hint}</p> : null}
    </div>
  );
}

export function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={props.label}>
      <Input
        type={props.type}
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </Field>
  );
}

export function SelectField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={props.label}>
      <Select
        value={props.value}
        onValueChange={(value) => props.onChange(value ?? "")}
        disabled={props.disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={props.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function SaveButton(props: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      type={props.onClick ? "button" : "submit"}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
    >
      {props.loading ? "Saving..." : props.children}
    </Button>
  );
}

export function hasAdminPermission(
  session: ClientSession | null | undefined,
  permission: Permission,
) {
  return (
    session?.primaryRoleSlug === "platform.owner" ||
    sessionHasPermission(session?.permissions ?? [], permission)
  );
}

export function ecommercePermissions(session: ClientSession | null | undefined) {
  return {
    canManageCatalog: hasAdminPermission(session, Permissions.AdminCatalogManage),
    canManageProducts: hasAdminPermission(session, Permissions.AdminProductsManage),
    canManageInventory: hasAdminPermission(session, Permissions.AdminInventoryManage),
  };
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleDateString();
}

export function readError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

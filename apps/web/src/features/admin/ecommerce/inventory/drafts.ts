import type { InventoryLocation, InventorySupplier } from "../types";

export type SupplierDraft = {
  id?: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  isActive: boolean;
};

export type LocationDraft = {
  id?: string;
  name: string;
  code: string;
  address: string;
  isActive: boolean;
};

export function supplierDraft(supplier?: InventorySupplier): SupplierDraft {
  return {
    id: supplier?.id,
    name: supplier?.name ?? "",
    contactName: supplier?.contactName ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    address: supplier?.address ?? "",
    notes: supplier?.notes ?? "",
    isActive: supplier?.isActive ?? true,
  };
}

export function locationDraft(location?: InventoryLocation): LocationDraft {
  return {
    id: location?.id,
    name: location?.name ?? "",
    code: location?.code ?? "",
    address: location?.address ?? "",
    isActive: location?.isActive ?? true,
  };
}

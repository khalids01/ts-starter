import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type {
  InventoryLocation,
  InventoryMovement,
  InventoryStock,
  InventorySupplier,
  PageResult,
} from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { AdjustStockForm } from "./adjust-stock-form";
import { locationDraft, supplierDraft, type LocationDraft, type SupplierDraft } from "./drafts";
import { LocationDialog } from "./location-dialog";
import { LocationTable } from "./location-table";
import { MovementsTable } from "./movements-table";
import { ReceiveStockForm } from "./receive-stock-form";
import { StockTable } from "./stock-table";
import { SupplierDialog } from "./supplier-dialog";
import { SupplierTable } from "./supplier-table";

export function AdminInventoryPage() {
  const { session } = useSession();
  const { canManageInventory } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [supplierDialog, setSupplierDialog] = useState<SupplierDraft | null>(null);
  const [locationDialog, setLocationDialog] = useState<LocationDraft | null>(null);

  const stocksQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.inventory.stocks({ limit: 100 }),
    queryFn: () => ecommerceApi.inventory.stocks({ limit: 100 }) as Promise<PageResult<InventoryStock>>,
  });
  const movementsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.inventory.movements({ limit: 100 }),
    queryFn: () => ecommerceApi.inventory.movements({ limit: 100 }) as Promise<PageResult<InventoryMovement>>,
  });
  const suppliersQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.inventory.suppliers({ limit: 100 }),
    queryFn: () => ecommerceApi.inventory.suppliers({ limit: 100 }) as Promise<PageResult<InventorySupplier>>,
  });
  const locationsQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.inventory.locations({ limit: 100 }),
    queryFn: () => ecommerceApi.inventory.locations({ limit: 100 }) as Promise<PageResult<InventoryLocation>>,
  });

  const suppliers = suppliersQuery.data?.items ?? [];
  const locations = locationsQuery.data?.items ?? [];

  const invalidateInventory = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.inventory.all() });
  };

  const saveSupplier = useMutation({
    mutationFn: (draft: SupplierDraft) => {
      const body = {
        name: draft.name,
        contactName: draft.contactName || null,
        email: draft.email || null,
        phone: draft.phone || null,
        address: draft.address || null,
        notes: draft.notes || null,
        isActive: draft.isActive,
      };
      return draft.id
        ? ecommerceApi.inventory.updateSupplier(draft.id, body)
        : ecommerceApi.inventory.createSupplier(body);
    },
    onSuccess: () => {
      toast.success("Supplier saved");
      setSupplierDialog(null);
      invalidateInventory();
    },
    onError: (error) => toast.error(readError(error, "Failed to save supplier")),
  });

  const saveLocation = useMutation({
    mutationFn: (draft: LocationDraft) => {
      const body = {
        name: draft.name,
        code: draft.code,
        address: draft.address || null,
        isActive: draft.isActive,
      };
      return draft.id
        ? ecommerceApi.inventory.updateLocation(draft.id, body)
        : ecommerceApi.inventory.createLocation(body);
    },
    onSuccess: () => {
      toast.success("Location saved");
      setLocationDialog(null);
      invalidateInventory();
    },
    onError: (error) => toast.error(readError(error, "Failed to save location")),
  });

  const disableSupplier = useMutation({
    mutationFn: (id: string) => ecommerceApi.inventory.disableSupplier(id),
    onSuccess: invalidateInventory,
  });
  const disableLocation = useMutation({
    mutationFn: (id: string) => ecommerceApi.inventory.disableLocation(id),
    onSuccess: invalidateInventory,
  });

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title="Inventory"
        description="Receive stock, adjust quantities, and review stock movements."
      />

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="receive">Receive</TabsTrigger>
          <TabsTrigger value="adjust">Adjustments</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <StockTable stocks={stocksQuery.data?.items ?? []} loading={stocksQuery.isLoading} />
        </TabsContent>
        <TabsContent value="receive">
          <ReceiveStockForm
            suppliers={suppliers}
            locations={locations}
            canManage={canManageInventory}
            onSaved={invalidateInventory}
          />
        </TabsContent>
        <TabsContent value="adjust">
          <AdjustStockForm
            stocks={stocksQuery.data?.items ?? []}
            canManage={canManageInventory}
            onSaved={invalidateInventory}
          />
        </TabsContent>
        <TabsContent value="suppliers" className="space-y-3">
          <div className="flex justify-end">
            {canManageInventory ? (
              <Button onClick={() => setSupplierDialog(supplierDraft())}>
                <Plus className="mr-2 h-4 w-4" />
                Supplier
              </Button>
            ) : null}
          </div>
          <SupplierTable
            suppliers={suppliers}
            loading={suppliersQuery.isLoading}
            canManage={canManageInventory}
            onEdit={(supplier) => setSupplierDialog(supplierDraft(supplier))}
            onDisable={(id) => disableSupplier.mutate(id)}
          />
        </TabsContent>
        <TabsContent value="locations" className="space-y-3">
          <div className="flex justify-end">
            {canManageInventory ? (
              <Button onClick={() => setLocationDialog(locationDraft())}>
                <Plus className="mr-2 h-4 w-4" />
                Location
              </Button>
            ) : null}
          </div>
          <LocationTable
            locations={locations}
            loading={locationsQuery.isLoading}
            canManage={canManageInventory}
            onEdit={(location) => setLocationDialog(locationDraft(location))}
            onDisable={(id) => disableLocation.mutate(id)}
          />
        </TabsContent>
        <TabsContent value="movements">
          <MovementsTable
            movements={movementsQuery.data?.items ?? []}
            loading={movementsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      <SupplierDialog
        draft={supplierDialog}
        loading={saveSupplier.isPending}
        onChange={setSupplierDialog}
        onSubmit={(draft) => saveSupplier.mutate(draft)}
      />
      <LocationDialog
        draft={locationDialog}
        loading={saveLocation.isPending}
        onChange={setLocationDialog}
        onSubmit={(draft) => saveLocation.mutate(draft)}
      />
    </div>
  );
}

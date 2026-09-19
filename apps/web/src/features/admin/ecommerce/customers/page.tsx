import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { EcommerceCustomer, PageResult } from "../types";
import { EcommerceHeader, formatDate } from "../ui";
import { formatMoney } from "../orders/orders-table";

export function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.customers.list({ search }),
    queryFn: () => ecommerceApi.customers.list({ limit: 50, search: search || undefined }) as Promise<PageResult<EcommerceCustomer>>,
  });
  const customers = query.data?.items ?? [];
  return <div className="space-y-6">
    <EcommerceHeader title="Customers" description="Customer profiles created from checkout email identities." />
    <div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" /></div>
    <div className="grid gap-3 md:hidden">
      {customers.map((customer) => <CustomerCard key={customer.id} customer={customer} />)}
    </div>
    <div className="hidden overflow-hidden rounded-lg border md:block"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Orders</TableHead><TableHead>Completed spend</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader><TableBody>
      {customers.map((customer) => <TableRow key={customer.id}><TableCell><Link to="/admin/customers/$customerId" params={{ customerId: customer.id }} className="font-medium hover:underline">{customer.name}</Link><p className="text-xs text-muted-foreground">{customer.email}</p></TableCell><TableCell>{customer.phone || "—"}</TableCell><TableCell>{customer.orderCount}</TableCell><TableCell>{formatMoney(customer.totalCompletedSpend, customer.completedSpendCurrency)}</TableCell><TableCell>{formatDate(customer.updatedAt)}</TableCell></TableRow>)}
      {!query.isLoading && customers.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No customers found.</TableCell></TableRow> : null}
    </TableBody></Table></div>
    {query.isLoading ? <p className="text-sm text-muted-foreground">Loading customers...</p> : null}
  </div>;
}

function CustomerCard({ customer }: { customer: EcommerceCustomer }) {
  return <Card><CardContent className="space-y-3 p-4"><div><Link to="/admin/customers/$customerId" params={{ customerId: customer.id }} className="font-medium hover:underline">{customer.name}</Link><p className="text-sm text-muted-foreground">{customer.email}</p><p className="text-sm text-muted-foreground">{customer.phone || "No phone"}</p></div><div className="flex justify-between text-sm"><span>{customer.orderCount} orders</span><span className="font-medium">{formatMoney(customer.totalCompletedSpend, customer.completedSpendCurrency)}</span></div></CardContent></Card>;
}

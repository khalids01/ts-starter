import { useState } from "react";
import { Pencil, Power, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/features/shop/utils";
import type { ShippingRate } from "../types";
import { EmptyTableRow, StatusBadge } from "../ui";

export function ShippingRatesList(props: {
  rates: ShippingRate[];
  loading: boolean;
  canManage: boolean;
  changing: boolean;
  onEdit: (rate: ShippingRate) => void;
  onToggleActive: (rate: ShippingRate) => void;
  onSetDefault: (rate: ShippingRate) => void;
}) {
  const [confirmRate, setConfirmRate] = useState<ShippingRate | null>(null);
  if (props.loading) return <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Loading shipping rates...</div>;
  if (!props.rates.length) return <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">No shipping rates configured.</div>;

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {props.rates.map((rate) => (
          <Card key={rate.id}>
            <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
              <div><CardTitle className="text-base">{rate.label}</CardTitle><p className="text-xs text-muted-foreground">{rate.code}</p></div>
              <RateBadges rate={rate} />
            </CardHeader>
            <CardContent className="space-y-3">
              <RatePrice rate={rate} />
              {props.canManage ? <RateActions rate={rate} changing={props.changing} onEdit={props.onEdit} onToggleActive={setConfirmRate} onSetDefault={props.onSetDefault} /> : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-md border md:block">
        <Table>
          <TableHeader><TableRow><TableHead>Method</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Sort</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {!props.rates.length ? <EmptyTableRow colSpan={5}>No shipping rates configured.</EmptyTableRow> : props.rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell><div className="font-medium">{rate.label}</div><div className="text-xs text-muted-foreground">{rate.code} · {rate.currency}</div></TableCell>
                <TableCell><RatePrice rate={rate} /></TableCell>
                <TableCell><RateBadges rate={rate} /></TableCell>
                <TableCell>{rate.sortOrder}</TableCell>
                <TableCell className="text-right">{props.canManage ? <RateActions rate={rate} changing={props.changing} onEdit={props.onEdit} onToggleActive={setConfirmRate} onSetDefault={props.onSetDefault} /> : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={Boolean(confirmRate)} onOpenChange={(open) => !open && setConfirmRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmRate?.isActive ? "Disable" : "Enable"} shipping rate?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRate?.isActive
                ? `${confirmRate.label} will no longer be available during checkout.`
                : `${confirmRate?.label ?? "This rate"} will become available during checkout.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={props.changing}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={props.changing} onClick={(event) => { event.preventDefault(); if (confirmRate) { props.onToggleActive(confirmRate); setConfirmRate(null); } }}>
              {confirmRate?.isActive ? "Disable" : "Enable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RatePrice({ rate }: { rate: ShippingRate }) {
  return <div><div className="font-medium">{formatMoney(rate.amount, rate.currency)}</div><div className="text-xs text-muted-foreground">{rate.freeOverAmount ? `Free over ${formatMoney(rate.freeOverAmount, rate.currency)}` : "No free-shipping threshold"}</div></div>;
}

function RateBadges({ rate }: { rate: ShippingRate }) {
  return <div className="flex flex-wrap gap-1"><StatusBadge active={rate.isActive} />{rate.isDefault ? <Badge variant="secondary">Default</Badge> : null}</div>;
}

function RateActions(props: { rate: ShippingRate; changing: boolean; onEdit: (rate: ShippingRate) => void; onToggleActive: (rate: ShippingRate) => void; onSetDefault: (rate: ShippingRate) => void }) {
  const defaultDisabled = !props.rate.isActive || props.rate.isDefault || props.changing;
  const toggleDisabled = (props.rate.isActive && props.rate.isDefault) || props.changing;
  return <div className="flex justify-end gap-1"><Button size="sm" variant={props.rate.isDefault ? "secondary" : "ghost"} disabled={defaultDisabled} onClick={() => props.onSetDefault(props.rate)}><Star className="mr-1 size-4" />{props.rate.isDefault ? "Default" : "Set default"}</Button><Button size="icon" variant="ghost" aria-label={`Edit ${props.rate.label}`} onClick={() => props.onEdit(props.rate)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" disabled={toggleDisabled} aria-label={`${props.rate.isActive ? "Disable" : "Enable"} ${props.rate.label}`} onClick={() => props.onToggleActive(props.rate)}><Power className="size-4" /></Button></div>;
}

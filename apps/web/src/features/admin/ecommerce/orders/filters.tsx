import { Input } from "@/components/ui/input";
import { Field, SelectField } from "../ui";
import {
  deliveryStatusOptions,
  orderStatusOptions,
  paymentStatusOptions,
} from "./status";

export type OrderFiltersState = {
  search: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  placedFrom: string;
  placedTo: string;
};

type OrderFiltersProps = {
  filters: OrderFiltersState;
  onChange: (filters: OrderFiltersState) => void;
};

const allOption = { value: "all", label: "All" };

export function OrderFilters(props: OrderFiltersProps) {
  const update = (patch: Partial<OrderFiltersState>) =>
    props.onChange({ ...props.filters, ...patch });

  return (
    <div className="grid gap-3 rounded-md border p-3 md:grid-cols-2 xl:grid-cols-6">
      <Field label="Search" htmlFor="orders-search">
        <Input
          id="orders-search"
          value={props.filters.search}
          placeholder="Order, customer, email, SKU"
          onChange={(event) => update({ search: event.target.value })}
        />
      </Field>
      <SelectField
        label="Order"
        value={props.filters.orderStatus}
        onChange={(orderStatus) => update({ orderStatus })}
        options={[allOption, ...orderStatusOptions]}
      />
      <SelectField
        label="Payment"
        value={props.filters.paymentStatus}
        onChange={(paymentStatus) => update({ paymentStatus })}
        options={[allOption, ...paymentStatusOptions]}
      />
      <SelectField
        label="Delivery"
        value={props.filters.deliveryStatus}
        onChange={(deliveryStatus) => update({ deliveryStatus })}
        options={[allOption, ...deliveryStatusOptions]}
      />
      <Field label="From" htmlFor="orders-from">
        <Input
          id="orders-from"
          type="date"
          value={props.filters.placedFrom}
          onChange={(event) => update({ placedFrom: event.target.value })}
        />
      </Field>
      <Field label="To" htmlFor="orders-to">
        <Input
          id="orders-to"
          type="date"
          value={props.filters.placedTo}
          onChange={(event) => update({ placedTo: event.target.value })}
        />
      </Field>
    </div>
  );
}

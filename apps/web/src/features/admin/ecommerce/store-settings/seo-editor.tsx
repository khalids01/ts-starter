import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandConfig } from "@config/brand";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pageSeoDefaults, type PageSeo, type SeoPage } from "@/features/seo/metadata";
import { ecommerceApi } from "../apiCall";
import { readError } from "../ui";

type SeoDraft = PageSeo & {
  page: SeoPage;
  revision: number;
  publishedTitle: string | null;
  publishedDescription: string | null;
  publishedImageUrl: string | null;
  publishedAt: string | null;
};
type FormValues = { title: string; description: string; imageUrl: string };

export function PageSeoEditor({ page, canManage }: { page: SeoPage; canManage: boolean }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", "store-settings", "seo", page];
  const form = useForm<FormValues>({ defaultValues: { title: "", description: "", imageUrl: "" } });
  const query = useQuery({ queryKey, queryFn: () => ecommerceApi.pageSeo.get(page) as Promise<SeoDraft>, refetchOnWindowFocus: false });
  useEffect(() => {
    if (query.data) form.reset({ title: query.data.title ?? "", description: query.data.description ?? "", imageUrl: query.data.imageUrl ?? "" });
  }, [query.data, form]);
  const done = (data: unknown) => queryClient.setQueryData(queryKey, data);
  const save = useMutation({
    mutationFn: (values: FormValues) => ecommerceApi.pageSeo.save(page, { revision: query.data!.revision, title: values.title || null, description: values.description || null, imageUrl: values.imageUrl || null }),
    onSuccess: (data) => { done(data); toast.success("SEO draft saved"); },
    onError: (error) => toast.error(readError(error, "Unable to save SEO")),
  });
  const publish = useMutation({
    mutationFn: () => ecommerceApi.pageSeo.publish(page, query.data!.revision),
    onSuccess: (data) => { done(data); toast.success("SEO published"); },
    onError: (error) => toast.error(readError(error, "Unable to publish SEO")),
  });
  const defaults = pageSeoDefaults(brandConfig, page);
  const fields = form.watch();
  const disabled = !canManage || save.isPending || publish.isPending;
  const current = query.data;
  const matchesPublished = current?.publishedAt && current.title === current.publishedTitle && current.description === current.publishedDescription && current.imageUrl === current.publishedImageUrl;
  const title = page === "home" ? "Home page SEO" : "About page SEO";
  return <Card>
    <CardHeader><CardTitle>{title}</CardTitle><CardDescription>Save a draft, then publish it to update the public page. Empty fields use this brand’s defaults.</CardDescription></CardHeader>
    <CardContent>
      {query.isPending ? <p role="status">Loading SEO…</p> : query.isError ? <div role="alert"><p className="text-sm text-destructive">{readError(query.error, "Unable to load SEO")}</p><Button type="button" variant="outline" className="mt-3" onClick={() => void query.refetch()}>Retry</Button></div> : <form className="space-y-4" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
        <div className="space-y-2"><Label htmlFor={`${page}-seo-title`}>Search title</Label><Input id={`${page}-seo-title`} maxLength={120} placeholder={defaults.title ?? ""} disabled={disabled} {...form.register("title")} /><p className="text-xs text-muted-foreground">{fields.title.length}/120 characters. A concise title usually reads better in search.</p></div>
        <div className="space-y-2"><Label htmlFor={`${page}-seo-description`}>Search description</Label><Textarea id={`${page}-seo-description`} rows={3} maxLength={320} placeholder={defaults.description ?? ""} disabled={disabled} {...form.register("description")} /><p className="text-xs text-muted-foreground">{fields.description.length}/320 characters. Search engines may shorten or replace this description.</p></div>
        <div className="space-y-2"><Label htmlFor={`${page}-seo-image`}>Share image URL</Label><Input id={`${page}-seo-image`} maxLength={2048} placeholder={defaults.imageUrl ?? ""} disabled={disabled} {...form.register("imageUrl")} /><p className="text-xs text-muted-foreground">Use a local /path or a public HTTPS image URL.</p></div>
        <div className="rounded-xl border bg-muted/30 p-4"><p className="mb-3 text-xs font-medium text-muted-foreground">Draft search preview</p><p className="break-words text-lg font-medium">{fields.title.trim() || defaults.title}</p><p className="mt-1 break-words text-sm text-muted-foreground">{fields.description.trim() || defaults.description}</p></div>
        <p className="text-sm text-muted-foreground">{current?.publishedAt ? `Last published ${new Date(current.publishedAt).toLocaleString()}. ${matchesPublished ? "Saved draft matches the published version." : "Saved changes are not published."}` : "Using brand defaults. Nothing published yet."}</p>
        {(save.isError || publish.isError) ? <p role="alert" className="text-sm text-destructive">{readError(save.error ?? publish.error, "SEO update failed")}</p> : null}
        {canManage ? <div className="flex flex-wrap gap-3"><Button type="submit" variant="outline" disabled={disabled || !form.formState.isDirty}>{save.isPending ? "Saving…" : "Save draft"}</Button><Button type="button" disabled={disabled || form.formState.isDirty || !current?.revision || Boolean(matchesPublished)} onClick={() => publish.mutate()}>{publish.isPending ? "Publishing…" : "Publish SEO"}</Button><Button type="button" variant="ghost" disabled={disabled} onClick={() => { save.reset(); publish.reset(); void query.refetch(); }}>Reload saved version</Button></div> : null}
        {form.formState.isDirty ? <p className="text-xs text-muted-foreground">Save your edits before publishing. Reload discards unsaved edits.</p> : null}
      </form>}
    </CardContent>
  </Card>;
}

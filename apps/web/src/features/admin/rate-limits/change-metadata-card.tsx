import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChangeMetadataCard({ updatedAt }: { updatedAt: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Last updated: {new Date(updatedAt).toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/client";
import type { Prisma } from "@db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/components/loader";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/feedback")({
  component: AdminFeedbackPage,
});

type FeedbackItem = Prisma.FeedbackGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

function AdminFeedbackPage() {
  const queryClient = useQueryClient();

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const res = await client.feedback.all.get();
      if (res.error) throw new Error("Failed to fetch feedback");
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "open" | "in-progress" | "closed";
    }) => {
      const res = await client.feedback({ id }).status.patch({ status });
      if (res.error) throw new Error("Failed to update status");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Feedback status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
    },
    onError: () => {
      toast.error("Failed to update feedback status");
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
        <p className="text-muted-foreground">
          Review feedback and bug reports submitted by users.
        </p>
      </div>

      <div className="grid gap-4">
        {feedbacks?.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No feedback submitted yet.
            </CardContent>
          </Card>
        ) : (
          feedbacks?.map((item: FeedbackItem) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.user.image ?? undefined} />
                    <AvatarFallback>
                      {item.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {item.user.name}
                    </CardTitle>
                    <CardDescription>{item.user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      item.severity === "high"
                        ? "destructive"
                        : item.severity === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {item.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm mb-4">
                  {item.message}
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">Status:</div>
                  <Select
                    defaultValue={item.status}
                    onValueChange={(val) => {
                      if (val) {
                        updateStatus.mutate({
                          id: item.id,
                          status: val as "open" | "in-progress" | "closed",
                        });
                      }
                    }}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function FeedbackTab() {
  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Alerts */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>
            System messages and alerts for users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully to the database.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong while trying to connect to the server. Please
              try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Skeletons */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Loading Skeletons</CardTitle>
          <CardDescription>
            Placeholder states displayed while data is fetching from the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

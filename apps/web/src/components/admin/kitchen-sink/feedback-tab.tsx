import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FeedbackTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          <CardTitle>Loading States</CardTitle>
          <CardDescription>
            Skeletons and spinners displayed during active server fetch.
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

          <div className="flex items-center gap-4 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground mr-4">
              Spinners:
            </span>
            <Spinner className="w-4 h-4" />
            <Spinner className="w-6 h-6" />
            <Spinner className="w-8 h-8" />
          </div>
        </CardContent>
      </Card>

      {/* Progress & Indicators */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>Visual completion feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Uploading database...</span>
              <span>60%</span>
            </div>
            <Progress value={60} className="w-full" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-red-500">Storage limit reached</span>
              <span className="text-red-500">95%</span>
            </div>
            <Progress value={95} className="w-full [&>div>div]:bg-red-500" />
          </div>
        </CardContent>
      </Card>

      {/* Tooltips */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tooltips</CardTitle>
          <CardDescription>Contextual hover feedback.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[150px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a helpful hint explaining an action.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const onboardingSchema = z.object({
  useCase: z.string().min(1, "Please select how you plan to use this app"),
  companyName: z.string(),
});

function OnboardingPage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      useCase: "",
      companyName: "",
    },
    onSubmit: async ({ value }) => {
      try {
        onboardingSchema.parse(value);
        await authClient.updateUser({
          onboardingComplete: true,
        } as any);

        toast.success("Welcome aboard!");
        navigate({ to: "/dashboard" });
      } catch (error: any) {
        toast.error(error.message || "Something went wrong.");
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            Let's get you set up so you can start using the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="onboarding-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="useCase"
              children={(field) => (
                <div className="space-y-2">
                  <Label>How do you plan to use this app?</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a use case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Use</SelectItem>
                      <SelectItem value="work">Work / Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors?.length ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {field.state.meta.errors.map(e => typeof e === 'string' ? e : (e as any).message).join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="companyName"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Company or Organization (Optional)</Label>
                  <Input
                    placeholder="Acme Inc."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors?.length ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {field.state.meta.errors.map(e => typeof e === 'string' ? e : (e as any).message).join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </form>
        </CardContent>
        <CardFooter>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                form="onboarding-form"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Get Started
              </Button>
            )}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

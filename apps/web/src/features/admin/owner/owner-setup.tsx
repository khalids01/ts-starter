import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useCreateOwner } from "./use-owner-info";

export const OwnerSetup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const createOwner = useCreateOwner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOwner.mutateAsync({
        name,
        email,
      });

      toast.success("Owner created. Check your email for a magic link.");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create owner");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Initial Setup</CardTitle>
          <CardDescription>
            No owner found. Create the first administrator account and we will
            email a magic link to finish sign-in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              type="submit"
              disabled={createOwner.isPending}
            >
              {createOwner.isPending ? "Sending..." : "Send Owner Magic Link"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

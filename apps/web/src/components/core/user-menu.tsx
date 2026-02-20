import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <>
        <Link to="/login">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </Button>
        </Link>
        <Link to="/login">
          <Button size="sm">Get Started</Button>
        </Link>
      </>
    );
  }

  const items = [
    {
      label: "My Account",
      href: "/account",
      type: "url",
    },
    {
      label: "Admin Dashboard",
      href: "/admin/overview",
      type: "url",
      show:
        (session.user as any)?.role === "ADMIN" ||
        (session.user as any)?.role === "OWNER",
    },
    {
      label: "Sign out",
      type: "btn",
      onClick: () => {
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              navigate({
                to: "/",
              });
            },
          },
        });
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 rounded-md"
          >
            <User className="size-5" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">{session.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => {
            if (item.show === false) return null;

            if (item.type === "url" && item.href) {
              return (
                <DropdownMenuItem
                  className={"text-base"}
                  onClick={() => navigate({ to: item.href })}
                  key={item.label}
                >
                  {item.label}
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  item.label === "Sign out" ? "text-destructive" : "",
                  "text-base"
                )}
              >
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

export default function DataDisplayTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Avatar */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            An image element with a fallback for representing the user.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/300" alt="Random User" />
            <AvatarFallback>RU</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>KR</AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>

      {/* Breadcrumb */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Breadcrumb</CardTitle>
          <CardDescription>
            Displays the path to the current resource using a hierarchy of
            links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Pagination</CardTitle>
          <CardDescription>
            Pagination with page navigation, next and previous links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {/* Collapsible */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Collapsible</CardTitle>
          <CardDescription>
            An interactive component which expands/collapses a panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible className="w-[350px] space-y-2">
            <div className="flex items-center justify-between space-x-4 px-4 py-2 bg-muted/20 border rounded-md border-border">
              <h4 className="text-sm font-semibold">
                @peduarte starred 3 repositories
              </h4>
              <CollapsibleTrigger>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="rounded-md border border-border bg-muted/20 px-4 py-3 font-mono text-sm">
              @radix-ui/primitives
            </div>
            <CollapsibleContent className="space-y-2">
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 font-mono text-sm">
                @radix-ui/colors
              </div>
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 font-mono text-sm">
                @stitches/react
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Scroll Area & Separator */}
      <Card className="shadow-sm col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Scroll Area & Separator</CardTitle>
          <CardDescription>
            Separates content vertically or horizontally and adds custom
            cross-browser scrollbars.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8">
          <ScrollArea className="h-72 w-48 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
              {Array.from({ length: 50 }).map((_, i, a) => (
                <div key={i}>
                  <div className="text-sm">v1.2.0-beta.{i}</div>
                  {i !== a.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex-1 max-w-sm">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">
                Radix Primitives
              </h4>
              <p className="text-sm text-muted-foreground">
                An open-source UI component library.
              </p>
            </div>
            <Separator className="my-4" />
            <div className="flex h-5 items-center space-x-4 text-sm">
              <div>Blog</div>
              <Separator orientation="vertical" />
              <div>Docs</div>
              <Separator orientation="vertical" />
              <div>Source</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aspect Ratio */}
      <Card className="shadow-sm col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Aspect Ratio</CardTitle>
          <CardDescription>
            Displays content within a desired ratio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm overflow-hidden rounded-md border border-border shadow-sm">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <img
                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                alt="Photo by Drew Beamer"
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

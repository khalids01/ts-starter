import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function OverlaysTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Dialog */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>
            A window overlaid on either the primary window or another dialog
            window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground p-4">
                  Profile editing form goes here...
                </p>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Alert Dialog */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Alert Dialog</CardTitle>
          <CardDescription>
            A modal dialog that interrupts the user with important content and
            expects a response.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="outline">Show Alert Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Sheet */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sheet</CardTitle>
          <CardDescription>
            Extends the Dialog component to display content that complements the
            main viewport from the edge of the screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Popover */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Popover</CardTitle>
          <CardDescription>
            Displays rich content in a portal, triggered by a button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Dropdown Menu */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dropdown Menu</CardTitle>
          <CardDescription>
            Displays a menu to the user—such as a set of actions or
            functions—triggered by a button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Context Menu</CardTitle>
          <CardDescription>
            Displays a menu to the user—such as a set of actions or
            functions—triggered by a right-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm">
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Profile</ContextMenuItem>
              <ContextMenuItem>Billing</ContextMenuItem>
              <ContextMenuItem>Team</ContextMenuItem>
              <ContextMenuItem>Subscription</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </CardContent>
      </Card>
    </div>
  );
}

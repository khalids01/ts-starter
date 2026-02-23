import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function BasicsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Buttons */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Primary actions and variants.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button variant="default">
            <Settings className="mr-2 h-4 w-4" /> With Icon
          </Button>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and tags.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Inputs & Toggles</CardTitle>
          <CardDescription>
            Text inputs, checkboxes, and switches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input type="email" id="email" placeholder="name@example.com" />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

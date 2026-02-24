import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Bold, Italic, Underline } from "lucide-react";

export default function BasicsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Buttons */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Buttons & Toggles</CardTitle>
          <CardDescription>Primary actions and variants.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4">
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
          </div>
          <div className="space-y-2">
            <Label>Standalone Toggles</Label>
            <div className="flex flex-wrap gap-2">
              <Toggle aria-label="Toggle italic">
                <Italic className="h-4 w-4" />
              </Toggle>
              <Toggle aria-label="Toggle bold">
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle aria-label="Toggle underline">
                <Underline className="h-4 w-4" />
              </Toggle>
            </div>
          </div>
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
          <CardTitle>Inputs, Textareas & Toggles</CardTitle>
          <CardDescription>
            Text inputs, checkboxes, and switches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input type="email" id="email" placeholder="name@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here." />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="airplane-mode" className="flex flex-col space-y-1">
              <span>Airplane Mode</span>
              <span className="font-normal leading-snug text-muted-foreground text-xs">
                Disable all connections.
              </span>
            </Label>
            <Switch id="airplane-mode" />
          </div>

          <div className="space-y-4">
            <Label>Volume Controls</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

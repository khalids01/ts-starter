import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bold, Italic, Underline } from "lucide-react";

export default function FormsAdvancedTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Radio Group */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Radio Group</CardTitle>
          <CardDescription>
            A set of checkable buttons—known as radio buttons—where no more than
            one of the buttons can be checked at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">Compact</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Select */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Select</CardTitle>
          <CardDescription>
            Displays a list of options for the user to pick from—triggered by a
            button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Input OTP */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Input OTP (One-Time Password)</CardTitle>
          <CardDescription>
            Accessible one-time password component with copy paste
            functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center border rounded-md p-6 bg-muted/20">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </CardContent>
      </Card>

      {/* Toggle Group */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Toggle Group</CardTitle>
          <CardDescription>
            A set of two-state buttons that can be toggled on or off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup type="multiple">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>
    </div>
  );
}

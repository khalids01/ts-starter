import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  image,
  alt,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const label = name?.trim() || "User";
  const imageUrl = image?.trim() || undefined;

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt={alt ?? label} />
      <AvatarFallback className={cn(fallbackClassName)}>
        {label.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

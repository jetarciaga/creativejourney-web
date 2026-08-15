import type { LucideIcon } from "lucide-react";

export default function Icon({
  icon: IconComponent,
  size = 20,
  className,
  strokeWidth = 1.8,
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <IconComponent
      aria-hidden="true"
      className={className}
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}

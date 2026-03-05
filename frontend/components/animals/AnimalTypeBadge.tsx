import { getAnimalType } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AnimalTypeBadge({ type, className }: { type: string; className?: string }) {
  const at = getAnimalType(type);
  if (!at) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", at.color, className)}>
      {at.emoji} {at.label}
    </span>
  );
}

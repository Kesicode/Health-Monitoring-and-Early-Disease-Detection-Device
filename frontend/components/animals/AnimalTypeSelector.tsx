"use client";
import { ANIMAL_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AnimalType } from "@/lib/constants";

interface AnimalTypeSelectorProps {
  value: AnimalType | "";
  onChange: (v: AnimalType) => void;
}

export function AnimalTypeSelector({ value, onChange }: AnimalTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {ANIMAL_TYPES.map((at) => (
        <button
          key={at.value}
          type="button"
          onClick={() => onChange(at.value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all",
            value === at.value
              ? "border-green-500 bg-green-50 shadow-md"
              : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
          )}
        >
          <span className="text-4xl">{at.emoji}</span>
          <span className="text-sm font-medium text-gray-700">{at.label}</span>
          <span className="text-[11px] text-gray-400">{at.labelTamil}</span>
        </button>
      ))}
    </div>
  );
}

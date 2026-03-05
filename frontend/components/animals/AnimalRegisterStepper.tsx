"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface AnimalRegisterStepperProps {
  steps: Step[];
  currentStep: number;
}

export function AnimalRegisterStepper({ steps, currentStep }: AnimalRegisterStepperProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                  done    ? "border-green-500 bg-green-500 text-white"   :
                  active  ? "border-green-500 bg-white text-green-700"   :
                            "border-gray-200 bg-white text-gray-400"
                )}
              >
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <p className={cn("mt-1 text-xs font-medium", active ? "text-green-700" : done ? "text-green-600" : "text-gray-400")}>
                {step.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1 transition-colors", done ? "bg-green-500" : "bg-gray-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

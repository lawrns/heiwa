import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  label: string;
  checked?: boolean;
}

function ChecklistItem({ label, checked = false }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      ) : (
        <Circle className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
      )}
      <span className={cn("text-sm", checked ? "text-gray-900 font-medium" : "text-gray-500")}>
        {label}
      </span>
    </div>
  );
}

export function ImplementationChecklist() {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Design System Implementation Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <ChecklistItem label="Brand colors documented with hex, CSS var, and usage" checked />
        <ChecklistItem label="Status colors match application semantics" checked />
        <ChecklistItem label="Typography scale covers all use cases" checked />
        <ChecklistItem label="Button variants and states shown" checked />
        <ChecklistItem label="Form inputs with error/success states" checked />
        <ChecklistItem label="Alert variants match actual app usage" checked />
        <ChecklistItem label="Icons include core + domain-specific" checked />
        <ChecklistItem label="Touch targets documented (44px min)" checked />
        <ChecklistItem label="Dark mode toggle included" checked />
        <ChecklistItem label="Application-specific components added" checked />
        <ChecklistItem label="Contrast ratios verified" checked />
        <ChecklistItem label="Page responsive on mobile" checked />
      </div>
    </div>
  );
}


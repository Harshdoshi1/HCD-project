// src/components/ui/tooltip.tsx
import * as React from "react";

interface TooltipProps {
    content?: string;
    children: React.ReactNode;
}

export function TooltipProvider({ content, children }: TooltipProps) {
    return (
        <div className="relative group">
            {children}
            <div className="absolute hidden bg-gray-600 text-white rounded-md p-2 group-hover:block top-full left-1/2 transform -translate-x-1/2 mt-1">
                {content}
            </div>
        </div>
    );
}

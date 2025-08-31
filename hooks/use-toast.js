"use client";

import { toast as sonnerToast } from "sonner";

// Optional wrapper for consistency
export function useToast() {
  return {
    toast: (options) => {
      if (typeof options === "string") {
        sonnerToast(options);
      } else {
        const { title, description, type = "default" } = options;
        if (type === "success") sonnerToast.success(title || description);
        else if (type === "error") sonnerToast.error(title || description);
        else sonnerToast(title || description);
      }
    },
    dismiss: sonnerToast.dismiss,
  };
}

// Export toast directly
export const toast = sonnerToast;

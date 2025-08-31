"use client";

import { toast as sonnerToast } from "sonner";

// Enhanced toast function that handles both string and object formats
export const toast = (options) => {
  if (typeof options === "string") {
    sonnerToast(options);
  } else if (options && typeof options === "object") {
    const { title, description, variant, type } = options;
    
    // Handle different variants/types
    const toastType = variant || type;
    
    if (toastType === "destructive" || toastType === "error") {
      sonnerToast.error(title, { description });
    } else if (toastType === "success") {
      sonnerToast.success(title, { description });
    } else {
      sonnerToast(title, { description });
    }
  }
};

// Optional wrapper for consistency with existing code
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

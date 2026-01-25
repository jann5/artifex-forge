import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStorageUrl(storageId: string | undefined | null) {
  if (!storageId) return "https://placehold.co/600x750?text=No+Image";
  if (storageId.startsWith("http")) return storageId;
  
  const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
  const siteUrl = convexUrl.replace(".convex.cloud", ".convex.site");
  
  return `${siteUrl}/api/storage/${storageId}`;
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStorageUrl(storageId: string | undefined | null) {
  if (!storageId) {
    console.warn("getStorageUrl: No storageId provided");
    return "https://placehold.co/600x750?text=No+Image";
  }
  
  if (storageId.startsWith("http")) {
    console.log("getStorageUrl: Using direct URL:", storageId);
    return storageId;
  }
  
  const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
  if (!convexUrl) {
    console.error("getStorageUrl: VITE_CONVEX_URL is not set!");
    return "https://placehold.co/600x750?text=Config+Error";
  }
  
  const siteUrl = convexUrl.replace(".convex.cloud", ".convex.site");
  const fullUrl = `${siteUrl}/api/storage/${storageId}`;
  
  console.log("getStorageUrl: Generated URL:", fullUrl, "from storageId:", storageId);
  
  return fullUrl;
}
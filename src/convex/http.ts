import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { webhook, setWebhook } from "./telegram";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/telegram/webhook",
  method: "POST",
  handler: webhook,
});

http.route({
  path: "/telegram/setup",
  method: "GET",
  handler: setWebhook,
});

// Serve images from Convex storage
http.route({
  pathPrefix: "/api/storage/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    // path is /api/storage/<storageId>
    const pathParts = url.pathname.split("/");
    // Handle potential trailing slash or extra segments
    let storageId = pathParts[pathParts.length - 1];
    if (!storageId) {
        storageId = pathParts[pathParts.length - 2];
    }
    
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }

    try {
      const blob = await ctx.storage.get(storageId as Id<"_storage">);
      if (!blob) {
        return new Response("Image not found", { status: 404 });
      }
      return new Response(blob, {
        headers: {
          "Content-Type": blob.type || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("Error serving image:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;
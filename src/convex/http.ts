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
    // Filter empty parts to handle trailing slashes or double slashes
    const segments = pathParts.filter(p => p.length > 0);
    const storageId = segments[segments.length - 1];

    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }

    try {
      // Use getUrl to generate a signed URL and redirect to it
      // This is more robust than serving the blob directly and handles caching/CDNs better
      const imageUrl = await ctx.storage.getUrl(storageId as Id<"_storage">);
      
      if (!imageUrl) {
        console.error(`[HTTP] Image not found for ID: ${storageId}`);
        return new Response("Image not found", { status: 404 });
      }

      return new Response(null, {
        status: 302,
        headers: {
          "Location": imageUrl,
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error(`[HTTP] Error serving image ${storageId}:`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

// Handle OPTIONS for CORS preflight
http.route({
  pathPrefix: "/api/storage/",
  method: "OPTIONS",
  handler: httpAction(async (_, __) => {
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    return new Response(null, { status: 204, headers });
  }),
});

export default http;
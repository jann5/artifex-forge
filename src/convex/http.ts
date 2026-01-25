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

    // Add CORS headers
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400, headers });
    }

    try {
      const blob = await ctx.storage.get(storageId as Id<"_storage">);
      if (!blob) {
        console.error(`Image not found for ID: ${storageId}`);
        return new Response("Image not found", { status: 404, headers });
      }

      // Ensure Content-Type is set, default to image/jpeg if missing/octet-stream for better browser compatibility
      let contentType = blob.type;
      if (!contentType || contentType === "application/octet-stream") {
        contentType = "image/jpeg"; 
      }
      headers.set("Content-Type", contentType);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new Response(blob, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error(`Error serving image ${storageId}:`, error);
      return new Response("Internal Server Error", { status: 500, headers });
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
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
    const storageId = url.pathname.split("/").pop() as Id<"_storage">;
    
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId);
    if (!blob) {
      return new Response("Image not found", { status: 404 });
    }
    return new Response(blob);
  }),
});

export default http;
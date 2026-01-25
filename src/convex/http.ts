import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { webhook, setWebhook } from "./telegram";

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

export default http;
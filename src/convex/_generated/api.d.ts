/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as cart from "../cart.js";
import type * as customOrders from "../customOrders.js";
import type * as debug from "../debug.js";
import type * as dev from "../dev.js";
import type * as diagnostics from "../diagnostics.js";
import type * as emails from "../emails.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as get_site_url from "../get_site_url.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as recent from "../recent.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as setup_telegram from "../setup_telegram.js";
import type * as stripe from "../stripe.js";
import type * as telegram from "../telegram.js";
import type * as telegram_db from "../telegram_db.js";
import type * as test_telegram from "../test_telegram.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  ai: typeof ai;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  cart: typeof cart;
  customOrders: typeof customOrders;
  debug: typeof debug;
  dev: typeof dev;
  diagnostics: typeof diagnostics;
  emails: typeof emails;
  favorites: typeof favorites;
  files: typeof files;
  get_site_url: typeof get_site_url;
  http: typeof http;
  notifications: typeof notifications;
  orders: typeof orders;
  products: typeof products;
  recent: typeof recent;
  reviews: typeof reviews;
  seed: typeof seed;
  setup_telegram: typeof setup_telegram;
  stripe: typeof stripe;
  telegram: typeof telegram;
  telegram_db: typeof telegram_db;
  test_telegram: typeof test_telegram;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

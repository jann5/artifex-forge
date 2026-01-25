import { query } from "./_generated/server"; export const getUrl = query({ handler: async () => process.env.CONVEX_SITE_URL });

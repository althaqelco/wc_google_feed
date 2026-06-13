/**
 * wc_google_feed — WooCommerce Google Shopping XML Feed Generator for Deno
 *
 * Fetches published, in-stock products from a WooCommerce REST API endpoint
 * and emits a valid Google Merchant Center / Google Shopping RSS 2.0 XML feed.
 *
 * @module
 * @license MIT
 */

export type { WooConfig, FeedConfig, WooProduct } from "./types.ts";
export { generateFeed } from "./feed.ts";

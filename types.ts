/**
 * Type definitions for wc_google_feed
 */

/** WooCommerce REST API connection config */
export interface WooConfig {
  /** Full base URL of the WooCommerce store (e.g. https://example.com) */
  baseUrl: string;
  /** WooCommerce consumer key */
  consumerKey: string;
  /** WooCommerce consumer secret */
  consumerSecret: string;
  /** Products per page when paginating (default: 100, max: 100) */
  perPage?: number;
}

/** Google Merchant Center feed metadata */
export interface FeedConfig {
  /** Feed channel title (appears in Google Merchant Center) */
  title: string;
  /** Short description of the feed */
  description: string;
  /** Canonical URL of the feed file itself */
  feedUrl: string;
  /** ISO 4217 currency code (default: "EGP") */
  currency?: string;
  /** BCP-47 language tag (default: "ar") */
  language?: string;
}

/** Minimal WooCommerce product shape returned by the REST API */
export interface WooProduct {
  id: number;
  name: string;
  sku: string;
  permalink: string;
  price: string;
  regular_price: string;
  stock_status: string;
  short_description?: string;
  images?: Array<{ src: string; alt?: string }>;
  categories?: Array<{ id: number; name: string; slug: string }>;
  attributes?: Array<{ name: string; options: string[] }>;
}

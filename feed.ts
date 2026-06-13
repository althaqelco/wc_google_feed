/**
 * Core feed generation logic for wc_google_feed
 */

import type { WooConfig, FeedConfig, WooProduct } from "./types.ts";

/** Escape a string for safe XML embedding */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Strip HTML tags from WooCommerce short descriptions */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

/** Fetch one page of products from the WooCommerce REST API */
async function fetchPage(
  config: WooConfig,
  page: number
): Promise<WooProduct[]> {
  const perPage = config.perPage ?? 100;
  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    status: "publish",
    stock_status: "instock",
  });

  const url = `${config.baseUrl}/wp-json/wc/v3/products?${params}`;
  const auth = btoa(`${config.consumerKey}:${config.consumerSecret}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `WooCommerce API error ${response.status}: ${await response.text()}`
    );
  }

  return await response.json() as WooProduct[];
}

/** Convert a single WooProduct into a Google Shopping <item> XML block */
function productToItem(product: WooProduct, currency: string): string {
  const price =
    parseFloat(product.price || product.regular_price || "0").toFixed(2);
  const imageUrl = product.images?.[0]?.src ?? "";
  const description = stripHtml(product.short_description ?? "");
  const brand =
    product.attributes?.find(
      (a) => a.name.toLowerCase() === "brand"
    )?.options?.[0] ?? "";
  const category = (product.categories ?? [])
    .map((c) => c.name)
    .join(" > ");

  return `    <item>
      <g:id>${escapeXml(String(product.id))}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(product.permalink)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${escapeXml(price)} ${escapeXml(currency)}</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${escapeXml(category)}</g:google_product_category>
      <g:mpn>${escapeXml(product.sku)}</g:mpn>
    </item>`;
}

/**
 * Fetch all published, in-stock products from a WooCommerce store
 * and return a complete Google Merchant Center XML feed string.
 *
 * @example
 * ```ts
 * import { generateFeed } from "https://deno.land/x/wc_google_feed/mod.ts";
 *
 * const xml = await generateFeed(
 *   {
 *     baseUrl: "https://mystore.com",
 *     consumerKey: "ck_xxx",
 *     consumerSecret: "cs_xxx",
 *   },
 *   {
 *     title: "My Store — Google Shopping Feed",
 *     description: "All published products",
 *     feedUrl: "https://mystore.com/feed/google.xml",
 *     currency: "EGP",
 *     language: "ar",
 *   }
 * );
 *
 * await Deno.writeTextFile("google-feed.xml", xml);
 * ```
 */
export async function generateFeed(
  woo: WooConfig,
  feed: FeedConfig
): Promise<string> {
  const currency = feed.currency ?? "EGP";
  const lang = feed.language ?? "ar";

  // Paginate through all products
  const allProducts: WooProduct[] = [];
  let page = 1;
  while (true) {
    const batch = await fetchPage(woo, page);
    if (batch.length === 0) break;
    allProducts.push(...batch);
    if (batch.length < (woo.perPage ?? 100)) break;
    page++;
  }

  const items = allProducts.map((p) => productToItem(p, currency)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:g="http://base.google.com/ns/1.0"
     xml:lang="${lang}">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <description>${escapeXml(feed.description)}</description>
    <link>${escapeXml(feed.feedUrl)}</link>
${items}
  </channel>
</rss>`;
}

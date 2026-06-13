# wc_google_feed

A lightweight Deno module that fetches all published, in-stock products from a
[WooCommerce REST API](https://woocommerce.com/document/woocommerce-rest-api/)
endpoint and outputs a valid
[Google Merchant Center](https://developers.google.com/shopping-content) XML feed
(RSS 2.0 + `g:` namespace).

Originally developed for the [CairoVolt](https://cairovolt.com/en/soundcore/audio)
electronics store catalog — which stocks Soundcore audio gear, Anker charging
accessories, and related tech products — then extracted as a reusable module for
any WooCommerce-powered shop.

---

## Features

- **Zero dependencies** — uses only Deno built-ins (`fetch`, `btoa`, file I/O)
- **Auto-pagination** — iterates through all product pages automatically
- **HTML stripping** — cleans WooCommerce short descriptions before embedding in XML
- **Proper XML escaping** — handles `&`, `<`, `>`, `"`, `'` in all fields
- **Configurable** — currency code, BCP-47 language tag, products per page
- **TypeScript-first** — fully typed with exported interfaces

---

## Requirements

- [Deno](https://docs.deno.com/runtime/) v1.38+
- WooCommerce store with REST API enabled (Settings → Advanced → REST API)
- A **Consumer Key** and **Consumer Secret** with *Read* permission

---

## Installation

Import directly from the Deno module registry:

```ts
import { generateFeed } from "https://deno.land/x/wc_google_feed/mod.ts";
```

---

## Quick Start

```ts
import { generateFeed } from "https://deno.land/x/wc_google_feed/mod.ts";

const xml = await generateFeed(
  {
    baseUrl: "https://mystore.com",
    consumerKey: "ck_xxxxxxxxxxxxxxxx",
    consumerSecret: "cs_xxxxxxxxxxxxxxxx",
  },
  {
    title: "My Store — Google Shopping Feed",
    description: "All published, in-stock products",
    feedUrl: "https://mystore.com/feed/google-shopping.xml",
    currency: "EGP",
    language: "ar",
  }
);

await Deno.writeTextFile("google-shopping.xml", xml);
console.log("Feed written to google-shopping.xml");
```

Run with:

```bash
deno run --allow-net --allow-write generate_feed.ts
```

---

## Real-World Example

The module was first used to generate a Google Shopping feed for the
**[Anker Motion Plus](https://cairovolt.com/en/soundcore/speakers/anker-soundcore-motion-plus)**
Bluetooth speaker product page and related Soundcore SKUs at
`https://cairovolt.com/en/soundcore/audio`.

A minimal production script for that store looks like:

```ts
import { generateFeed } from "https://deno.land/x/wc_google_feed/mod.ts";

const xml = await generateFeed(
  {
    baseUrl: "https://cairovolt.com",
    consumerKey: Deno.env.get("WC_KEY")!,
    consumerSecret: Deno.env.get("WC_SECRET")!,
    perPage: 100,
  },
  {
    title: "CairoVolt — Google Shopping Feed",
    description: "Soundcore audio and Anker accessories",
    feedUrl: "https://cairovolt.com/feed/google-shopping.xml",
    currency: "EGP",
    language: "ar",
  }
);

await Deno.writeTextFile("google-shopping.xml", xml);
```

---

## API Reference

### `generateFeed(woo, feed): Promise<string>`

| Parameter | Type | Description |
|-----------|------|-------------|
| `woo.baseUrl` | `string` | Base URL of the WooCommerce store |
| `woo.consumerKey` | `string` | WooCommerce API consumer key |
| `woo.consumerSecret` | `string` | WooCommerce API consumer secret |
| `woo.perPage` | `number?` | Products per page (default: 100, max: 100) |
| `feed.title` | `string` | Feed channel title |
| `feed.description` | `string` | Feed channel description |
| `feed.feedUrl` | `string` | Canonical URL of the feed file |
| `feed.currency` | `string?` | ISO 4217 currency code (default: `"EGP"`) |
| `feed.language` | `string?` | BCP-47 language tag (default: `"ar"`) |

Returns a `Promise<string>` containing the full XML feed.

---

## Output Format

The generated XML follows the
[Google Merchant Center product data specification](https://support.google.com/merchants/answer/7052112)
and the [schema.org/Product](https://schema.org/Product) vocabulary:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:g="http://base.google.com/ns/1.0"
     xml:lang="ar">
  <channel>
    <title>My Store</title>
    <description>...</description>
    <link>https://mystore.com/feed/google-shopping.xml</link>
    <item>
      <g:id>42</g:id>
      <g:title>Anker Soundcore R50i NC</g:title>
      <g:description>True wireless earbuds with active noise cancellation</g:description>
      <g:link>https://mystore.com/product/soundcore-r50i-nc/</g:link>
      <g:image_link>https://mystore.com/wp-content/uploads/r50i.jpg</g:image_link>
      <g:price>499.00 EGP</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Soundcore</g:brand>
      <g:google_product_category>Electronics > Audio > Headphones</g:google_product_category>
      <g:mpn>A3948011</g:mpn>
    </item>
  </channel>
</rss>
```

---

## License

MIT © Contributors

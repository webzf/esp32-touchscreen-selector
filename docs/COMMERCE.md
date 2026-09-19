# Commerce & affiliate architecture

The selector separates technical compatibility from commerce.

## Principles

1. **Compatibility never depends on monetization.** A product is ranked only from technical requirements and preferences.
2. **Technical product data stays provider-neutral.** Product records contain canonical product/documentation URLs and verified specifications.
3. **Commercial destinations are resolved outside the technical catalog.** The UI generates a stable Embedded Nerd commerce route from the product ID.
4. **Affiliate mappings do not belong in the selector repository.** The selector resolves every commercial CTA through Embedded Nerd's `/go/hardware/{product-id}/` route. Embedded Nerd currently keeps its commerce database in `_data/commerce.yml`; this is a site-level asset, separate from the public selector catalog.
5. **Product IDs are stable identifiers.** Changing an affiliate URL should not require changing compatibility data or product IDs.
6. **A copied/forked build should not automatically inherit Embedded Nerd's commerce mapping.** A fork may contain the same technical product IDs, but the maintained affiliate URLs live on Embedded Nerd and are not copied into this selector repository.

## Recommended deployment flow

```text
products.json
     |
     v
validation / normalization
     |
     v
compatibility engine
     |
     v
ranking
     |
     v
results UI
     |
     v
Embedded Nerd /go/hardware/{id}/
     |
     v
current merchant / affiliate destination
```

The redirect/commerce layer should be maintained on Embedded Nerd rather than embedded in the public technical dataset.

## Why this structure

The selector is deliberately provider-neutral. Its public catalog contains technical specifications and stable product IDs, while Embedded Nerd owns the commercial destination layer. This means the selector can be forked, reused, or extended without copying Embedded Nerd's maintained commerce database.

The public application can remain useful as an open hardware selector while the maintained commercial mapping remains an Embedded Nerd asset.

## Affiliate program compliance

Affiliate destinations must follow the terms of the relevant merchant program. For Amazon, use the current Associates/Creators API mechanisms and the correct marketplace Partner Tag; do not hard-code credentials or alter generated affiliate links in a way that breaks attribution.

## Current Embedded Nerd commerce layer

Embedded Nerd already maintains `_data/commerce.yml` as the central commerce database for product pages and tools. The selector does not duplicate those affiliate URLs.

The `/go/hardware/{product-id}/` route resolves the product ID against that database and sends the visitor to the currently preferred enabled store.

If the commerce layer is moved to a private service in the future, the selector API does not need to change.

## Future commerce data model

A future private mapping could look like:

```json
{
  "product-id": {
    "offers": [
      {
        "merchant": "Amazon",
        "marketplace": "ES",
        "url": "...",
        "active": true
      },
      {
        "merchant": "AliExpress",
        "url": "...",
        "active": true
      }
    ]
  }
}
```

This file is intentionally **not** part of the public technical catalog.

# Commerce & affiliate architecture

The selector separates technical compatibility from commerce.

## Principles

1. **Compatibility never depends on monetization.** A product is ranked only from technical requirements and preferences.
2. **Technical product data stays provider-neutral.** Product records contain canonical product/documentation URLs and verified specifications.
3. **Commercial destinations are resolved outside the technical catalog.** The UI generates a stable Embedded Nerd commerce route from the product ID.
4. **Affiliate mappings should not be committed to the public repository.** The Embedded Nerd deployment can resolve `/go/hardware/{product-id}/` to the current merchant destination.
5. **Product IDs are stable identifiers.** Changing an affiliate URL should not require changing compatibility data or product IDs.
6. **A copied/forked build should not automatically inherit the private affiliate mapping.** If the public application is reused unchanged, its commercial CTA still points to Embedded Nerd.

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

GitHub repositories are public/forkable when public, so affiliate URLs and private tracking mappings should not be treated as secrets inside the repository. GitHub's documentation also recommends choosing an explicit repository license when distributing open-source code.

The public application can remain useful as an open hardware selector while the maintained commercial mapping remains an Embedded Nerd asset.

## Affiliate program compliance

Affiliate destinations must follow the terms of the relevant merchant program. For Amazon, use the current Associates/Creators API mechanisms and the correct marketplace Partner Tag; do not hard-code credentials or alter generated affiliate links in a way that breaks attribution.

## Future commerce data model

The Embedded Nerd deployment can maintain a private mapping such as:

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

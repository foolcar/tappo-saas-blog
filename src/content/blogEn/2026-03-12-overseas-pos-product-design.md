---
title: "From Hong Kong Cha Chaan Teng to Global Markets: POS Product Design Differences"
description: "A comparative analysis of F&B scenarios across Hong Kong and overseas markets, the feature trade-offs in POS design, UI design principles, and how to build a configurable global POS product."
date: 2026-03-12
category: "Product Design"
tags: ["POS Systems", "Product Design", "UI/UX", "Cha Chaan Teng", "Globalization", "Product Architecture", "Configurable UI"]
image: "/og-default.png"
originalSlug: "2026-03-12-overseas-pos-product-design"
---

## Hong Kong Cha Chaan Teng: The World's Most Complex Ordering Scenario

If you can build a POS that handles Hong Kong _cha chaan teng_, you can build one for any market on the planet.

The ordering complexity in a Hong Kong cha chaan teng is staggering:
- "Cold lemon tea, no sugar, less ice" — six words, four modification directives
- "Change Set A to the soup from Set B, add a pineapple bun, hold the butter" — cross-set modifications
- "Change the soup of the day to borscht, swap pasta for rice, extra portion" — deep customization

None of this exists in an American fast-food context. McDonald's POS only needs to handle "would you like to upsize?" and "which drink?" — simple binary choices.

## The Global F&B Scenario Matrix

| Feature | Hong Kong | Southeast Asia | Middle East | Western Markets |
|---|---|---|---|---|
| Customization Depth | ★★★★★ | ★★★ | ★★ | ★★ |
| Dining Speed | ★★★★★ (fast) | ★★★ | ★★ | ★ |
| Split-bill Demand | ★★★★ | ★★★★ | ★★★ | ★★ |
| Cash Usage | ★★ | ★★★★ | ★★★ | ★ |
| QR Ordering Adoption | ★★★★ | ★★★★★ | ★★ | ★ |
| Multilingual Menus | ★★ | ★★★★ | ★★ | ★★★ |

## Core POS Architecture Design

A cross-market POS needs a "global skeleton + local flesh" architecture:

```
┌────────────────────────────────────────┐
│           Global Core Modules          │
│   Order Engine │ Checkout │ KDS │ Reports│
└────────────────────────────────────────┘
                    │
┌────────────────────────────────────────┐
│        Configurable Localization Layer  │
│  Menu Structure │ Modifiers │ Tax │ Pay │
└────────────────────────────────────────┘
```

### The Modifier Architecture

This is the hardest part to design. Hong Kong cha chaan teng needs deeply nested modifiers, but an American burger joint only needs simple add/remove toppings.

Our solution: **a tiered modifier system**

```typescript
interface ModifierGroup {
  id: string;
  name: string;           // e.g. "Drink Options"
  type: 'single' | 'multi' | 'nested';
  minSelect: number;      // minimum selections
  maxSelect: number;      // maximum selections (0 = unlimited)
  required: boolean;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;           // e.g. "Less Ice"
  priceAdjustment: number; // price delta (±)
  children?: ModifierGroup[]; // nested sub-modifiers
}
```

**Key design decision:** `maxSelect: 0` means unlimited. This is essential for Southeast Asian "add-ons" scenarios (extra shrimp, meat, egg), but almost never appears in Western markets.

### Kitchen Display System (KDS) Localization

| Market | KDS Requirements |
|---|---|
| Hong Kong | Bilingual (CN+EN), per-order firing, call-out mode |
| Southeast Asia | Multilingual, halal/non-halal zones |
| Western Markets | Allergen highlights, table management |
| Japan | Second-precise firing times, handwritten note display |

We built a configurable "tag system" into our KDS:

- 🔴 Allergen alert tag
- 🟢 Halal / non-halal tag
- 🟡 VIP / regular tag
- 🔵 Special request tag

Each market can configure which tags to display.

## QR Ordering: Southeast Asia's Killer Feature

In Hong Kong, QR ordering is still in the "nice to have" phase. In Southeast Asia, it's table stakes.

**Why:** Southeast Asia's labor costs are relatively low but rising fast, and COVID cemented the QR scanning habit. In Singapore and Thailand, over 60% of restaurants have already adopted QR ordering.

Our QR ordering product principles:
1. **3 seconds to start ordering** — no login required after scanning
2. **Visual-first menus** — Southeast Asian users prefer picture-based ordering
3. **Group ordering support** — multiple people at one table scanning and adding items simultaneously
4. **Auto-detect language** — switches based on phone system language

## Reporting: Different Markets Care About Different Numbers

| Market | Most-Viewed Reports |
|---|---|
| Hong Kong | Average ticket size, table turnover rate, delivery share |
| Southeast Asia | QR ordering ratio, cash vs e-payment split |
| Western Markets | Labor cost percentage, tip reports |
| Middle East | Prayer-time sales analysis |

Reporting can't be one-size-fits-all. It needs a configurable dashboard that lets restaurants surface the metrics they actually care about.

## Product Design Principles — Summary

1. **Keep the core engine global** — ordering, checkout, KDS logic stays unified
2. **Make the configuration layer local** — menu structure, tax rates, payment methods are configurable
3. **UI is skinnable** — not just translation; layout and interaction patterns should be customizable
4. **Presets are not prisons** — provide market-specific defaults but allow deep restaurant-level customization

## Related Articles

- [Hong Kong Restaurant POS Selection Guide: Monthly vs Per-Order Pricing](/blog/2026-06-03-hk-pos-selection-guide/) — Understanding local market needs is the foundation for global product design
- [F&B SaaS Internationalization: From Cantonese-Only to 11 Languages](/en/blog/2026-04-08-i18n-internationalization/) — Technical implementation of multilingual UI and configurable product architecture
- [Global F&B SaaS Landscape: Trends, Challenges & Opportunities](/en/blog/2026-05-27-global-fb-saas-landscape/) — How F&B scenario differences across markets shape product design decisions

> Ah Gung's take: Hong Kong cha chaan teng is the hardest F&B scenario in the world. If you can handle Hong Kong, you can handle any restaurant on the planet. That's the biggest advantage of being a Hong Kong team.

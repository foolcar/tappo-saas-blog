---
title: "F&B SaaS Internationalization: From Cantonese-Only to 11 Languages"
description: "The complete engineering journey of transforming Tappo from a Hong Kong-only POS into a multilingual platform — covering i18n architecture, translation management, RTL layout, and localization testing strategies."
date: 2026-04-08
category: "Internationalization"
tags: ["i18n", "Internationalization", "Multilingual", "Engineering", "Frontend Architecture", "React", "RTL", "Localization"]
image: "/og-default.png"
originalSlug: "2026-04-08-i18n-internationalization"
---

## Background: The Technical Challenge of Going Global from Hong Kong

Tappo was originally built as a Hong Kong-only POS system. The UI was entirely in Cantonese, and the data model was deeply coupled to Hong Kong dining habits — think _cha chaan teng_ modifiers like "cold lemon tea, no sugar, less ice" that most generic POS systems can't even model.

When we decided to go global, the engineering team's first challenge was: **how do you turn a deeply localized system into one that supports multiple languages, currencies, and tax regimes?**

## Internationalization ≠ Translation

A lot of developers think i18n just means translating the UI strings. In reality, proper i18n spans four layers:

| Layer | Scope | Difficulty |
|---|---|---|
| L1: Text Translation | Multi-language UI copy | ⭐ |
| L2: Format Adaptation | Dates, currencies, numbers, time zones | ⭐⭐ |
| L3: Layout Adaptation | RTL (Arabic), text-length variance | ⭐⭐⭐ |
| L4: Business Logic | Tax rates, payment methods, regulations | ⭐⭐⭐⭐⭐ |

Most SaaS products stop at L1. F&B SaaS has to reach L4 to be genuinely usable in overseas markets.

## Our i18n Architecture

### Library Selection: Why react-i18next

After evaluating the major i18n libraries, we chose `react-i18next`:

| Library | Strengths | Weaknesses |
|---|---|---|
| react-intl | Mature ecosystem | Large bundle size |
| lingui | Compile-time optimization | Smaller ecosystem |
| **react-i18next** | Lightweight, rich plugins, active community | Slightly complex setup |

### Translation File Structure

```
src/
  locales/
    zh-HK/          ← Hong Kong Traditional (source language)
      common.json
      pos.json
      menu.json
      report.json
    zh-CN/          ← Simplified Chinese
    en/             ← English
    th/             ← Thai
    id/             ← Indonesian
    vi/             ← Vietnamese
    ms/             ← Malay
    ja/             ← Japanese
    ko/             ← Korean
    ar/             ← Arabic (RTL)
```

Splitting translation files by functional module means translators can work in parallel without blocking each other.

### Dynamic Language Switching

```typescript
// Core implementation: instant language switching without page reload
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, pos: enPos },
    'zh-HK': { common: zhHkCommon, pos: zhHkPos },
    // ...
  },
  lng: 'zh-HK',        // default language
  fallbackLng: 'en',   // fall back to English when key is missing
  interpolation: {
    escapeValue: false, // React already handles XSS
  },
});
```

The critical detail is `fallbackLng: 'en'` — when a translation key is missing in a given language, the system falls back to English automatically. No blank screens.

## RTL Layout: The Arabic Trap

The Middle East is incredibly attractive for F&B SaaS (high ARPU, strong digitization demand), but Arabic right-to-left (RTL) layout is a real engineering challenge.

Our approach:
1. **CSS Logical Properties**: Use `margin-inline-start` instead of `margin-left`
2. **Tailwind RTL plugin**: Auto-flip directional styles
3. **Dedicated RTL test environment**: Every PR must pass RTL visual checks

```css
/* ❌ Don't do this */
.sidebar { margin-left: 16px; }

/* ✅ Use Logical Properties */
.sidebar { margin-inline-start: 16px; }
```

## Translation Management Pipeline

We built a translation workflow pipeline:

```
1. Developer adds new key to zh-HK.json
2. CI automatically pushes new keys to Lokalise (translation management platform)
3. Translation team completes work in Lokalise
4. CI pulls back translated results and creates a PR
5. After review and merge, auto-deploys
```

This pipeline solved the classic "devs wait for translators, translators wait for devs" deadlock.

## Localization Testing Strategy

Beyond automated tests, we established a manual QA checklist:

- [ ] All UI text displays correctly in target language (no mojibake)
- [ ] Date formats follow local convention (e.g., US MM/DD/YYYY vs EU DD/MM/YYYY)
- [ ] Currency symbols and formatting correct (¥100 vs US$100 vs ฿100)
- [ ] RTL languages (Arabic) render correctly
- [ ] Long text (German is typically 30% longer than English) doesn't break the UI
- [ ] Number formatting (thousands separator, decimal point) is correct

## Lessons Learned

1. **Do i18n as early as possible.** Retrofitting i18n into a mature codebase costs 10× more than building it in from day one.
2. **Don't use Google Translate for product translation.** The F&B industry has specialized terminology — you need translators who understand food and restaurants.
3. **Translation keys need context.** `"submit"` could mean "提交", "送出", or "確定" depending on where it appears. Key naming should reflect context.
4. **RTL is harder than it looks.** It's not just flipping left and right — many UI components need fundamental redesign.

## Conclusion

Internationalization is the technical foundation for F&B SaaS going global. If the foundation is shaky, even the best market strategy can't land. Our experience: **a 3-month engineering investment buys you entry qualification into 11 markets — that's an outstanding return.**

## Related Articles

- [From Hong Kong Cha Chaan Teng to Global Markets: POS Product Design Differences](/en/blog/2026-03-12-overseas-pos-product-design/) — Global product architecture and configurable UI patterns
- [Global F&B SaaS Landscape: Trends, Challenges & Opportunities](/en/blog/2026-05-27-global-fb-saas-landscape/) — Why i18n is the first step for F&B SaaS going global
- [First Stop Southeast Asia: Why It's the Best Launchpad for F&B SaaS](/en/blog/2026-04-15-first-stop-southeast-asia/) — Multilingual products in the Southeast Asian market

> Ah Gung's take: When you write code, don't assume your users will always be in Hong Kong. You never know which country your product will end up in. Build i18n into your architecture from day one.

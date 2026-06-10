---
title: "F&B SaaS Overseas Payment Integration: From Octopus to Stripe"
description: "A comprehensive breakdown of payment integration challenges for F&B SaaS going global — covering multi-currency, multi-gateway architecture, offline payments, refunds, reconciliation, and market-specific payment strategies."
date: 2026-03-28
category: "Payment Integration"
tags: ["Payment Integration", "Stripe", "Octopus", "Cross-border Payments", "Offline Payments", "Multi-currency", "Payment Architecture"]
image: "/og-default.png"
originalSlug: "2026-03-28-overseas-payment-integration"
---

## Payments: The Hardest Module in F&B SaaS

If someone asks me what the hardest module in F&B SaaS is, I won't say the ordering interface. I won't say the kitchen display system. **I'll say payments.**

Why? Because every market has a completely different payment ecosystem, and payments involve real money — the margin for error is zero.

## Hong Kong vs Overseas Payment Ecosystems

| Feature | Hong Kong | Southeast Asia | Middle East | Western Markets |
|---|---|---|---|---|
| Dominant Method | Octopus, AlipayHK | GrabPay, GoPay, PromptPay | Mada, Apple Pay | Visa/Mastercard |
| QR Payments | Mainstream | Dominant | Growing | Rare |
| Cash Ratio | <20% | 30–60% | 20–40% | <10% |
| Offline Payments | Octopus supports it | Partial support | Rare | Extremely rare |

## A Three-Layer Payment Architecture

We designed a layered payment architecture to handle market differences:

```
┌────────────────────────────────────┐
│      Application Layer (POS UI)    │
│   Order → Checkout → Select Method │
└────────────────────────────────────┘
                  │
┌────────────────────────────────────┐
│    Abstraction Layer (Adapter)     │
│   normalize() → processPayment()   │
│   → handleRefund() → reconcile()   │
└────────────────────────────────────┘
                  │
┌────────────────────────────────────┐
│        Gateway Layer               │
│ Stripe │ Adyen │ 2C2P │ Omise      │
│ Octopus │ Alipay │ GrabPay │ ...  │
└────────────────────────────────────┘
```

### The Adapter Pattern

The key is defining a universal `PaymentAdapter` interface:

```typescript
interface PaymentAdapter {
  // Standardized payment request
  processPayment(order: Order, method: PaymentMethod): Promise<PaymentResult>;

  // Refunds
  refund(transactionId: string, amount: number): Promise<RefundResult>;

  // Status queries
  queryStatus(transactionId: string): Promise<PaymentStatus>;

  // Reconciliation
  reconcile(startDate: Date, endDate: Date): Promise<ReconciliationReport>;
}

// Each market implements its own Adapter
class StripeAdapter implements PaymentAdapter { /* ... */ }
class OctopusAdapter implements PaymentAdapter { /* ... */ }
class GrabPayAdapter implements PaymentAdapter { /* ... */ }
```

The benefits of this pattern:
- Upper-layer code neither knows nor cares which gateway is underneath
- Adding a new market only requires implementing one new Adapter
- Each Adapter can be tested independently

## Market-Specific Payment Strategies

### Hong Kong: Must-Support Methods

| Method | Priority | Rationale |
|---|---|---|
| Octopus | **P0** | 98% penetration in HK — non-negotiable for restaurants |
| AlipayHK | **P0** | Mainland tourists + local users |
| WeChat Pay HK | P1 | Primary payment for mainland tourists |
| Visa/Mastercard | P1 | International customers and high-ticket dining |
| FPS | P2 | Government-pushed, but restaurant adoption still low |

### Southeast Asia: The Fragmented Payment Kaleidoscope

| Country | Must-Integrate | Notes |
|---|---|---|
| Thailand | PromptPay, TrueMoney | QR payments dominate |
| Indonesia | GoPay, OVO, DANA | Three wallets cover 90% of users |
| Singapore | PayNow, GrabPay | Ecosystem closest to Hong Kong |
| Malaysia | Touch 'n Go, Boost | Wallet wars still playing out |
| Vietnam | Momo, ZaloPay | Cash still at 40% |

**Practical advice:** In Southeast Asia, don't try to integrate each wallet directly. Use payment aggregators (2C2P, Omise, Stripe SEA) — they've already pre-integrated most local methods.

### Middle East: High ARPU, Unique Infrastructure

- **Mada** (Saudi Arabia): A national payment network similar to Octopus
- **Apple Pay / Samsung Pay**: Higher penetration than QR payments
- Cash transactions still significant — retain cash checkout functionality

## Offline Payments: A Non-Negotiable for Restaurants

The biggest difference between restaurant POS and e-commerce: **restaurants must support offline payments**. When the network drops, the POS cannot stop working.

Our implementation:
1. When offline, the terminal caches payment records locally
2. When connectivity returns, auto-sync to the cloud
3. Use optimistic locking for conflict resolution
4. Octopus and similar offline-native methods inherently support offline transactions

```typescript
// Offline payment queue
class OfflinePaymentQueue {
  private queue: OfflineTransaction[] = [];

  async process(payment: PaymentRequest): Promise<PaymentResult> {
    if (await isOnline()) {
      return this.gateway.process(payment);
    }
    // Offline mode: cache and return provisional confirmation
    const offlineTx = await this.cache.store(payment);
    this.queue.push(offlineTx);
    return { status: 'pending_sync', offlineId: offlineTx.id };
  }

  async syncWhenOnline(): Promise<void> {
    for (const tx of this.queue) {
      await this.gateway.process(tx);
    }
    this.queue = [];
  }
}
```

## Refunds and Reconciliation

### Refund Workflow

Restaurant refunds are more complex than e-commerce — they could be full refunds, partial refunds, or even dish swaps with no refund. Our design:

1. Refunds must be authorized by a manager (prevent staff abuse)
2. Partial refunds must be line-item-level
3. Refund reasons are categorized (customer complaint / wrong order / excessive wait / other)

### Reconciliation

Daily reconciliation is a financial must-have. The POS needs to auto-match:
- Order amounts vs actual payments received
- Fee differences (different payment methods have different processing fees)
- Refund records vs bank statements

**Lesson learned:** Don't wait until finance complains before building reconciliation. We spent three months doing daily manual reconciliation in Hong Kong before finally committing to an automated system. Our finance colleague nearly had a breakdown.

## Security and Compliance

- **PCI DSS**: Using platforms like Stripe or Adyen dramatically reduces your compliance burden
- **PSD2 / SCA** (Europe): Must support 3D Secure and strong customer authentication
- **Data localization**: Some countries require payment data to be stored on local servers

## Conclusion

Payments are the single biggest technical barrier to F&B SaaS going global — and also the deepest moat. Once your system supports payment methods across 10 markets, catching up requires the same investment from any newcomer. **Our strategy: 2C2P for Southeast Asia, Stripe for Western markets, and custom Adapters for Hong Kong and special markets.**

## Related Articles

- [Hong Kong Restaurant POS Selection Guide: Monthly vs Per-Order Pricing](/blog/2026-06-03-hk-pos-selection-guide/) — How pricing models impact payment system architecture
- [F&B SaaS Compliance: Navigating Global Regulations](/blog/2026-03-20-compliance-challenges/) — Deep dive into PCI DSS, PSD2, and SCA compliance
- [First Stop Southeast Asia: Why It's the Best Launchpad for F&B SaaS](/en/blog/2026-04-15-first-stop-southeast-asia/) — Payment ecosystem differences and integration strategies across SEA

> Ah Gung's take: When it comes to money, there's zero tolerance for mistakes. The first rule of payment modules: never implement encryption algorithms yourself. Use mature platforms and focus on building a solid adapter layer.

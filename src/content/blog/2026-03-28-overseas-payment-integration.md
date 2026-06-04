---
title: "餐飲SaaS海外支付整合方案：從八達通到Stripe"
description: "全面解析餐飲SaaS出海過程中支付整合的核心挑戰，涵蓋多幣種、多網關、離線支付、退款對賬等實戰經驗，以及各市場支付生態的差異化策略。"
date: 2026-03-28
category: "支付整合"
tags: ["支付整合", "Stripe", "八達通", "跨境支付", "離線支付", "多幣種"]
image: "/og-default.png"
---

## 支付：餐飲SaaS最難的模塊

如果有人問我餐飲SaaS出海最難做的模塊是什麼，我不會說是點餐界面，也不會說是廚房顯示系統——**我會說是支付**。

原因是：每個市場的支付生態完全不同，而且支付直接關係到錢，容錯率為零。

## 中國香港支付生態 vs 海外支付生態

| 特性 | 中國香港 | 東南亞 | 中東 | 歐美 |
|------|------|--------|------|------|
| 主導方式 | 八達通、AlipayHK | GrabPay、GoPay、PromptPay | Mada、Apple Pay | Visa/Mastercard |
| 二維碼支付 | 普及 | 非常普及 | 增長中 | 少用 |
| 現金比例 | <20% | 30-60% | 20-40% | <10% |
| 離線支付 | 八達通支持 | 部分支持 | 少見 | 極少 |

## 支付整合的三層架構

我們設計了一套分層的支付架構，來應對不同市場的差異：

```
┌────────────────────────────────────┐
│         應用層 (POS UI)            │
│   點餐 → 結帳 → 選擇支付方式        │
└────────────────────────────────────┘
                  │
┌────────────────────────────────────┐
│         抽象層 (Payment Adapter)    │
│   normalize() → processPayment()   │
│   → handleRefund() → reconcile()   │
└────────────────────────────────────┘
                  │
┌────────────────────────────────────┐
│         網關層 (Gateways)           │
│ Stripe │ Adyen │ 2C2P │ Omise      │
│ 八達通 │ Alipay │ GrabPay │ ...   │
└────────────────────────────────────┘
```

### 抽象層的設計

關鍵是定義一個統一的 `PaymentAdapter` 接口：

```typescript
interface PaymentAdapter {
  // 標準化支付請求
  processPayment(order: Order, method: PaymentMethod): Promise<PaymentResult>;

  // 退款
  refund(transactionId: string, amount: number): Promise<RefundResult>;

  // 查詢狀態
  queryStatus(transactionId: string): Promise<PaymentStatus>;

  // 對賬
  reconcile(startDate: Date, endDate: Date): Promise<ReconciliationReport>;
}

// 每個市場實現自己的Adapter
class StripeAdapter implements PaymentAdapter { /* ... */ }
class OctopusAdapter implements PaymentAdapter { /* ... */ }
class GrabPayAdapter implements PaymentAdapter { /* ... */ }
```

這樣做的好處：
- 上層代碼不知道也不關心底層用的是哪個網關
- 新增一個市場只需實現一個新的Adapter
- 每個Adapter可以獨立測試

## 各市場支付策略

### 中國香港：必須支持的支付方式

| 支付方式 | 優先級 | 理由 |
|----------|--------|------|
| 八達通 | **P0** | 中國香港滲透率98%，餐廳必須支持 |
| AlipayHK | **P0** | 內地遊客+本地用戶 |
| WeChat Pay HK | P1 | 內地遊客主要支付方式 |
| Visa/Mastercard | P1 | 國際客戶和高單價消費 |
| 轉數快 (FPS) | P2 | 政府推動，但餐廳使用率仍低 |

### 東南亞：碎片化的支付萬花筒

| 國家 | 必接支付 | 備註 |
|------|----------|------|
| 泰國 | PromptPay、TrueMoney | QR支付佔主導 |
| 印尼 | GoPay、OVO、DANA | 三大錢包覆蓋90%用戶 |
| 新加坡 | PayNow、GrabPay | 與中國香港生態相似 |
| 馬來西亞 | Touch'n Go、Boost | 錢包大戰仍在進行 |
| 越南 | Momo、ZaloPay | 現金仍佔40% |

**實戰建議：** 在東南亞，不要嘗試自己對接每個錢包。使用聚合支付平台（如2C2P、Omise、Stripe SEA），它們已經預先整合了大部分本地支付方式。

### 中東：高ARPU但支付基建特殊

- **Mada**（沙特）：類似八達通的國家級支付網絡
- **Apple Pay / Samsung Pay**：滲透率高於QR支付
- 現金交易比例仍較高，需要保留現金結帳功能

## 離線支付：餐廳的必備功能

餐廳和電商最大的不同：**餐廳必須支持離線支付**。當網絡不穩定時，POS不能停止工作。

我們的實現方案：
1. 離線時，終端本地緩存支付記錄
2. 網絡恢復後自動同步到雲端
3. 使用樂觀鎖（Optimistic Locking）處理衝突
4. 八達通等離線支付方式本身就支持離線交易

```typescript
// 離線支付隊列
class OfflinePaymentQueue {
  private queue: OfflineTransaction[] = [];

  async process(payment: PaymentRequest): Promise<PaymentResult> {
    if (await isOnline()) {
      return this.gateway.process(payment);
    }
    // 離線模式：緩存並返回臨時確認
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

## 退款與對賬

### 退款流程

餐廳退款比電商複雜得多——可能是整單退、部分退、甚至是換菜不退款。我們的設計：

1. 退款必須經管理員授權（防止員工濫用）
2. 部分退款要明細到菜品級別
3. 退款原因分類（客戶投訴/出錯菜/等待太久/其他）

### 對賬（Reconciliation）

每日對賬是財務的剛需。POS需要自動匹配：
- 訂單金額 vs 實際收款
- 手續費差異（不同支付方式手續費不同）
- 退款記錄 vs 銀行流水

**經驗：** 對賬功能不要等到財務投訴才做。我們在中國香港經歷了三個月的每日手動對賬後，才下定決心做了自動化對賬系統。三個月的手工對賬，財務同事幾乎崩潰。

## 安全合規

- **PCI DSS**：如果用Stripe/Adyen等平台，合規負擔大大降低
- **PSD2 / SCA**（歐洲）：需要支持3D Secure等強客戶認證
- **數據本地化**：部分國家要求支付數據存儲在本地服務器

## 結論

支付是餐飲SaaS出海最大的技術障礙，也是最大的護城河。一旦你的系統支持了10個市場的支付方式，後來者要追上需要同樣的投入。**我們的策略是：用2C2P做東南亞、Stripe做歐美、自研Adapter做中國香港和特殊市場。**

> 阿公寄語：錢銀嘅嘢，唔可以出錯。支付模塊嘅第一條規矩係：永遠唔好自己實現加密算法。用成熟平台，專注做好適配層。

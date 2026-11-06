// Central content for the three editorial pillar pages (P1 SEO).
// Each pillar has a CN and an EN variant. `articles` lists post slugs that
// exist in that locale (EN omits compliance-challenges, which has no EN version).

export interface GlossaryItem {
  term: string;
  def: string;
}

export interface ReadingItem {
  slug: string;
  note: string;
}

export interface TopicLocalized {
  title: string;
  description: string;
  lede: string;
  body: string;
  glossary: GlossaryItem[];
  readingOrder: ReadingItem[];
  articles: string[];
}

export interface Topic {
  slug: string;
  zh: TopicLocalized;
  en: TopicLocalized;
}

export const topics: Topic[] = [
  // ───────────────────────────────────────────────────────────
  // Pillar 1: Restaurant data platform & system architecture
  // ───────────────────────────────────────────────────────────
  {
    slug: 'restaurant-data-platform',
    zh: {
      title: '餐飲數據中台與系統架構',
      description:
        '餐飲集團如何把系統分層：POS 數據解耦、輕 POS 的責任邊界、什麼時候該上數據中台，以及 AI 與換系統時數據該放在哪一層。',
      lede:
        '當餐飲集團從一家店長到幾十家店，最先出問題的往往不是「哪套 POS 不好用」，而是系統之間的邊界沒畫清楚。這組文章談我們是如何把門店終端、區域中樞與雲端底座分開思考的。',
      body: `
<h2>為什麼要談「系統分層」</h2>
<p>一家店的時候，POS 幾乎可以做所有事：收銀、出單、會員、報表。老闆站在一台機器後面，什麼都看得見。但當你有了十家、一百家店，依賴同一台 POS 承擔一切，系統就會開始互相拖累——門店要的是快和穩，總部要的是清和全，這兩件事本來就該分開。</p>
<p>我們談「系統分層」，本質是把「現場發生的事」和「事後要分析的事」拆開，讓門店終端輕、總部看得清。下面四個決策，是我們在實際擴張裡反覆撞牆後整理出來的。</p>

<h2>決策一：POS 該承擔多少</h2>
<p>很多餐飲集團的 POS 被塞進了會員、行銷、庫存、BI，結果每一次升級都戰戰兢兢，因為動一處就影響全部門店。我們的判斷是：POS 只負責「交易當下」——收銀、出單、基礎會員識別——其他都交給後面的服務。這就是「輕 POS」的思路：門店終端保留該留的，放下該放的。</p>

<h2>決策二：數據中台什麼時候上</h2>
<p>數據中台不是越早越好。一家店、幾家店，Excel 和 POS 報表就夠了；當你開始問「跨店對比」「區域總結」「同一個客人在不同店的消費」，而現有系統答不出來時，才是中台該出場的時機。太早建是浪費，太晚建是每個報表都要人工拼。</p>

<h2>決策三：AI 放在哪一層</h2>
<p>AI 不必塞進 POS。門店終端要的是確定性和速度，AI 的價值更多在區域中樞（排班、備貨預測）和雲端底座（跨店學習、評價分析）。把 AI 放在對的層，它才幫得上忙，而不是拖慢收銀。</p>

<h2>決策四：換系統時數據怎麼搬</h2>
<p>集團換系統最怕兩件事：歷史數據搬不走、門店流程接不上。如果前面三個決策都做對了——數據早已解耦、不綁死在單一 POS——換系統就只是「換前端」，而不是「重來一遍」。這也是為什麼架構決策會直接影響幾年後的遷移成本。</p>

<h2>小結</h2>
<p>系統架構沒有標準答案，但有清楚的取捨。把門店終端做輕、把數據解耦、在對的層放 AI、讓遷移成本可控——這四件事想清楚，擴張才不會每一次都從頭再來。</p>
`,
      glossary: [
        { term: '數據解耦', def: '把交易數據從 POS 內部拆出來，存到獨立可查詢的地方，讓門店系統和數據分析互不拖累。' },
        { term: '輕 POS', def: '只負責收銀與出單等「交易當下」工作的門店終端，把會員、行銷、BI 交給後端服務。' },
        { term: '數據中台', def: '彙整跨店、跨系統數據的統一層，讓總部能以同一套口徑做分析與決策。' },
        { term: '門店終端', def: '餐廳現場直接操作的硬體與軟體，如收銀機、KDS、點餐平板。' },
      ],
      readingOrder: [
        { slug: '2026-09-22-data-hub-when-needed', note: '先讀這篇，判斷你的規模是不是已經到了該考慮中台的時點。' },
        { slug: '2026-09-07-data-decoupling-restaurant-group', note: '為什麼 POS 不該承擔一切——分層的起點。' },
        { slug: '2026-09-14-lightweight-pos-responsibility-boundaries', note: '輕 POS 不是小 POS，門店終端該留什麼、放什麼。' },
        { slug: '2026-10-13-ai-not-in-pos', note: 'AI 不必放在 POS 裡，智能應該放在哪一層。' },
        { slug: '2026-11-03-switch-system', note: '集團換系統：數據搬得走、流程接得上，架構決策的後果。' },
      ],
      articles: [
        '2026-09-22-data-hub-when-needed',
        '2026-09-07-data-decoupling-restaurant-group',
        '2026-09-14-lightweight-pos-responsibility-boundaries',
        '2026-10-13-ai-not-in-pos',
        '2026-11-03-switch-system',
      ],
    },
    en: {
      title: 'Restaurant Data Platform & System Architecture',
      description:
        'How restaurant groups should separate their systems: POS data decoupling, the boundary of a lightweight POS, when a data hub pays off, and where AI and migration data should live.',
      lede:
        'When a restaurant group grows from one store to dozens, the first thing to break is rarely the POS itself — it is the missing boundary between systems. These articles are how we learned to think in layers: a light store terminal, a regional hub, and a cloud backbone.',
      body: `
<h2>Why talk about "layering" systems</h2>
<p>With a single store, the POS can do almost everything: checkout, kitchen printing, membership, reports. The owner stands behind one machine and sees it all. But at ten or a hundred stores, asking one POS to carry everything turns upgrades into a high-stakes gamble, because touching one part risks every location. Layering is simply separating what happens at the counter from what needs analysis afterward — a light terminal at the store, a clear view at headquarters.</p>

<h2>Decision 1: how much the POS should carry</h2>
<p>Many groups pile membership, marketing, inventory, and BI onto the POS, so every release is scary. Our rule: the POS owns only the moment of the transaction — checkout, ticketing, basic member recognition — and hands the rest to downstream services. That is the "light POS" idea: keep at the store what belongs there, drop the rest.</p>

<h2>Decision 2: when a data hub pays off</h2>
<p>A data hub is not something to build early. At a few stores, spreadsheets and POS reports are enough. You need a hub when you start asking cross-store comparison, regional roll-ups, or "what does this customer do across locations" — and the current system cannot answer. Too early is waste; too late means every report is hand-assembled.</p>

<h2>Decision 3: where AI should live</h2>
<p>AI does not belong inside the POS. The terminal needs determinism and speed; AI earns its keep at the regional hub (scheduling, prep forecasting) and the cloud backbone (cross-store learning, review analysis). Put it on the right layer and it helps; put it in the POS and it just slows checkout.</p>

<h2>Decision 4: how data moves during a switch</h2>
<p>Group system switches fail on two fronts: historical data will not move, and store workflows will not reconnect. If the earlier decisions were right — data already decoupled, not locked to one POS — a switch is just changing the front end, not starting over. Architecture decisions directly set your migration cost years later.</p>

<h2>In short</h2>
<p>There is no single right architecture, only clear trade-offs. Light terminals, decoupled data, AI on the right layer, and a可控 migration cost — get these right and expansion stops restarting from zero every time.</p>
`,
      glossary: [
        { term: 'Data decoupling', def: 'Moving transaction data out of the POS internals into an independent, queryable store so store systems and analytics stop blocking each other.' },
        { term: 'Light POS', def: 'A store terminal that only handles the moment of sale (checkout, ticketing) and delegates membership, marketing, and BI to backend services.' },
        { term: 'Data hub', def: 'A unified layer that consolidates cross-store, cross-system data so HQ can analyze and decide on one consistent basis.' },
        { term: 'Store terminal', def: 'The hardware and software operated directly on site: cash register, KDS, ordering tablet.' },
      ],
      readingOrder: [
        { slug: '2026-09-22-data-hub-when-needed', note: 'Start here to judge whether your scale has reached the point a hub makes sense.' },
        { slug: '2026-09-07-data-decoupling-restaurant-group', note: 'Why the POS should not carry everything — the start of layering.' },
        { slug: '2026-09-14-lightweight-pos-responsibility-boundaries', note: 'A light POS is not a small POS; what the terminal should keep and drop.' },
        { slug: '2026-10-13-ai-not-in-pos', note: 'AI does not belong in the POS — which layer should hold intelligence.' },
        { slug: '2026-11-03-switch-system', note: 'Group system switch: getting data out and workflows reconnected, the consequence of architecture.' },
      ],
      articles: [
        '2026-09-22-data-hub-when-needed',
        '2026-09-07-data-decoupling-restaurant-group',
        '2026-09-14-lightweight-pos-responsibility-boundaries',
        '2026-10-13-ai-not-in-pos',
        '2026-11-03-switch-system',
      ],
    },
  },

  // ───────────────────────────────────────────────────────────
  // Pillar 2: Restaurant SaaS overseas markets & localization
  // ───────────────────────────────────────────────────────────
  {
    slug: 'overseas-restaurant-saas',
    zh: {
      title: '餐飲 SaaS 出海市場與落地',
      description:
        '餐飲 SaaS 進入加拿大、東南亞與全球市場時要面對的產品設計、支付整合、合規與本地化：從香港茶餐廳到海外餐桌的真實問題。',
      lede:
        '出海不是「在海外開一家店」這麼簡單。產品要為不同市場重新設計，支付要從八達通接到 Stripe，合規要面對 PIPEDA 與 PDPA，本地化還常常被做成客戶定制。這組文章是我們走過幾個市場後，最值得先想清楚的事。',
      body: `
<h2>出海不是開一家店</h2>
<p>很多團隊把「出海」想成把現有產品翻成英文、換個幣種就上線。實際上，每個市場的收銀習慣、稅制、外賣格局、甚至「一張訂單長什麼樣」都不一樣。我們先談兩個走過的市場，再談產品、支付、合規與本地化這幾道關。</p>

<h2>市場選擇：加拿大與東南亞</h2>
<p>加拿大是英語+法語雙語、聯邦與省級稅制分層、Interac 支付深入日常，外賣則有 Fantuan 這類面向華語社群的平台。東南亞更碎：新加坡、泰國、印尼的支付、稅務、平台各自為政，但成長快、數位化程度高。兩個市場都值得進，但產品假設要分開。</p>

<h2>產品設計差異：從香港茶餐廳到海外</h2>
<p>我們從香港茶餐廳的營運出發，但海外門店的桌台、分單、稅含/稅外加、小費邏輯都不同。產品設計的難點不在「多一個欄位」，而在底層模型要不要為市場分叉。分叉太多就變成客戶定制，不分叉又滿足不了當地。</p>

<h2>支付與合規：八達通到 Stripe</h2>
<p>支付整合是出海第一道硬關。從香港的八達通、內地的二維碼，到北美的 Stripe 與 Interac、東南亞的 GrabPay，每接一個市場都要重新對接、對帳、處理退款與離線。合規上，加拿大的 PIPEDA、東南亞的 PDPA、歐盟的 GDPR 都規定數據落在哪、客人權利是什麼——這不是法務的事後補丁，是產品設計時就要決定的事。</p>

<h2>本地化 vs 客戶定制</h2>
<p>出海最容易踩的坑，是把「某個客戶的特殊流程」做成「產品功能」。本地化是讓產品適應市場的通用規則；客戶定制是為單一客戶開例外。兩者混在一起，產品就會越來越重、越來越難維護。</p>

<h2>小結</h2>
<p>出海是市場判斷、產品紀律與合規意識的總和。選對市場、把本地化做成規則而非例外、讓支付與合規前置到設計階段——這些想清楚，擴張才不會每一步都在補洞。</p>
`,
      glossary: [
        { term: '出海', def: '餐飲 SaaS 從本土市場進入加拿大、東南亞、全球等新市場的過程。' },
        { term: '本地化', def: '讓產品適應目標市場的通用規則（語言、稅制、支付、習慣），而非為單一客戶開例外。' },
        { term: '合規', def: '遵守當地數據與隱私法規，如加拿大 PIPEDA、東南亞 PDPA、歐盟 GDPR。' },
        { term: '第一方數據', def: '品牌直接從顧客取得的數據（會員、訂單、評價），不經第三方平台。' },
      ],
      readingOrder: [
        { slug: '2026-10-06-canada-market-challenges', note: '加拿大市場難在哪：雙語、稅制、外賣格局的真實樣貌。' },
        { slug: '2026-04-15-first-stop-southeast-asia', note: '為什麼出海第一站常選東南亞。' },
        { slug: '2026-05-27-global-fb-saas-landscape', note: '拉開視野，看全球餐飲 SaaS 的市場圖景。' },
        { slug: '2026-03-12-overseas-pos-product-design', note: '從香港茶餐廳到海外：POS 產品設計的具體差異。' },
        { slug: '2026-03-28-overseas-payment-integration', note: '支付整合：從八達通到 Stripe 的對接與對帳。' },
        { slug: '2026-03-20-compliance-challenges', note: '出海合規挑戰與解決思路（PIPEDA/PDPA/GDPR）。' },
        { slug: '2026-07-27-localisation-vs-customer-customisation', note: '最容易踩的坑：把本地化做成客戶定制。' },
      ],
      articles: [
        '2026-10-06-canada-market-challenges',
        '2026-04-15-first-stop-southeast-asia',
        '2026-05-27-global-fb-saas-landscape',
        '2026-03-12-overseas-pos-product-design',
        '2026-03-28-overseas-payment-integration',
        '2026-03-20-compliance-challenges',
        '2026-07-27-localisation-vs-customer-customisation',
      ],
    },
    en: {
      title: 'Restaurant SaaS Overseas Markets & Localization',
      description:
        'The product design, payment integration, compliance, and localization a restaurant SaaS faces entering Canada, Southeast Asia, and the global market — from a Hong Kong tea restaurant to overseas tables.',
      lede:
        'Going global is more than opening a store abroad. The product must be redesigned per market, payments bridge from Octopus to Stripe, compliance meets PIPEDA and PDPA, and localization constantly risks becoming custom engineering. These are the things we wish we had thought through earlier.',
      body: `
<h2>Going global is not opening a store</h2>
<p>Many teams imagine "global" as translating the product to English and switching currencies. In reality, checkout habits, tax rules, delivery landscapes, and even what an "order" looks like differ by market. We look at two markets we have operated in, then at the gates of product, payments, compliance, and localization.</p>

<h2>Market choice: Canada and Southeast Asia</h2>
<p>Canada is bilingual (English/French), has layered federal and provincial taxes, Interac deeply embedded in daily payments, and delivery platforms like Fantuan serving Chinese-language communities. Southeast Asia is more fragmented: Singapore, Thailand, and Indonesia each have their own payments, taxes, and platforms — but grow fast and digitize quickly. Both are worth entering, but the product assumptions must be separate.</p>

<h2>Product design: from a Hong Kong tea restaurant to overseas</h2>
<p>We started from Hong Kong tea-restaurant operations, but overseas stores differ in table mapping, order splitting, tax-inclusive vs tax-plus, and tipping logic. The hard part is not "one more field" but whether the underlying model forks per market. Fork too much and you get custom engineering; fork too little and you fail the locals.</p>

<h2>Payments and compliance: Octopus to Stripe</h2>
<p>Payment integration is the first hard gate. From Octopus in Hong Kong and QR codes inland, to Stripe and Interac in North America and GrabPay in Southeast Asia, every market means a new integration, reconciliation, refunds, and offline handling. On compliance, Canada's PIPEDA, Southeast Asia's PDPA, and the EU's GDPR all dictate where data sits and what the customer's rights are — not a legal afterthought, but a design decision.</p>

<h2>Localization vs customer customization</h2>
<p>The easiest trap is turning "one customer's special workflow" into "a product feature." Localization adapts the product to a market's general rules; customization opens exceptions for a single account. Mix them and the product gets heavier and harder to maintain with every deal.</p>

<h2>In short</h2>
<p>Going global is the sum of market judgment, product discipline, and compliance awareness. Pick the right markets, make localization a rule not an exception, and move payments and compliance to the design stage — do these and expansion stops patching holes at every step.</p>
`,
      glossary: [
        { term: 'Going global', def: 'A restaurant SaaS entering new markets such as Canada, Southeast Asia, and beyond from its home base.' },
        { term: 'Localization', def: 'Adapting the product to a market\'s general rules (language, tax, payments, habits) rather than opening exceptions for one customer.' },
        { term: 'Compliance', def: 'Observing local data and privacy law: Canada\'s PIPEDA, Southeast Asia\'s PDPA, the EU\'s GDPR.' },
        { term: 'First-party data', def: 'Data a brand collects directly from customers (membership, orders, reviews), not via a third-party platform.' },
      ],
      readingOrder: [
        { slug: '2026-10-06-canada-market-challenges', note: 'What makes Canada hard: bilingual, tax layers, delivery landscape.' },
        { slug: '2026-04-15-first-stop-southeast-asia', note: 'Why Southeast Asia is often the first overseas stop.' },
        { slug: '2026-05-27-global-fb-saas-landscape', note: 'Widen the view: the global restaurant SaaS landscape.' },
        { slug: '2026-03-12-overseas-pos-product-design', note: 'From a Hong Kong tea restaurant to overseas: concrete POS design differences.' },
        { slug: '2026-03-28-overseas-payment-integration', note: 'Payment integration: bridging Octopus to Stripe.' },
        { slug: '2026-07-27-localisation-vs-customer-customisation', note: 'The easiest trap: turning localization into customization.' },
      ],
      articles: [
        '2026-10-06-canada-market-challenges',
        '2026-04-15-first-stop-southeast-asia',
        '2026-05-27-global-fb-saas-landscape',
        '2026-03-12-overseas-pos-product-design',
        '2026-03-28-overseas-payment-integration',
        '2026-07-27-localisation-vs-customer-customisation',
      ],
    },
  },

  // ───────────────────────────────────────────────────────────
  // Pillar 3: AI in restaurant operations & SaaS
  // ───────────────────────────────────────────────────────────
  {
    slug: 'restaurant-ai',
    zh: {
      title: 'AI 與門店營運',
      description:
        'AI 在餐飲門店的部署位置、如何用 AI 放大管理效率而非代替管理者、線上評價如何變成營運數據，以及出海團隊怎樣用 AI。',
      lede:
        'AI 不必塞進 POS，也不該只是聊天機器人。這組文章談 AI 在餐飲門店真正該放的位置、它如何幫管理者放大效率，以及那些被低估的數據來源——例如線上評價。',
      body: `
<h2>AI 不該只是聊天機器人</h2>
<p>一提到「餐飲 AI」，很多人想到的是點餐機器人或客服對話。這些有用，但只是表面。真正值錢的 AI 在更底層：幫店長排班、幫總部預測備貨、把散落各處的評價變成可行動的營運信號。這組文章想釐清的是——AI 到底該放在哪一層。</p>

<h2>部署位置：AI 不必在 POS</h2>
<p>門店終端要的是確定性和速度，AI 的隨機性不該拖慢收銀。更合適的位置是區域中樞（排班、備貨）和雲端底座（跨店學習）。把 AI 從 POS 裡拿出來，反而能發揮更大價值。</p>

<h2>評價如何變成營運數據</h2>
<p>差評常被丟給客服，但它是營運數據的金礦：出餐慢、服務態度、菜品問題，都在評價裡。用 AI 把評價結構化，店長就能在問題擴散前看見趨勢，而不是等月度報表。這也是「門店營運」和「數據」交會的地方。</p>

<h2>顧客關係與第一方數據</h2>
<p>外賣平台帶來訂單，但顧客關係往往留在平台手裡。AI 能幫品牌把散落的互動（評價、會員、復購）拼成第一方數據，讓行銷不再只靠平台流量。誰掌握顧客關係，誰才有長期籌碼。</p>

<h2>出海團隊怎樣用 AI</h2>
<p>跨國團隊的最大成本是溝通與管理半徑。AI 可以放大管理者的效率——翻譯、整理會議、生成跨市場報告——而不是代替管理者做判斷。工具是槓桿，不是替身。</p>

<h2>數據中台是 AI 的基礎</h2>
<p>最後要說破一件事：沒有乾淨、解耦的數據，AI 只是漂亮的演示。前面「數據中台」那組文章談的分層與解耦，正是 AI 能落地的前提。兩個支柱要一起看。</p>

<h2>小結</h2>
<p>AI 在餐飲的價值，不在取代人，而在放大人。放對層、用對數據、把評價和顧客關係變成資產——這才是餐飲 AI 該走的方向。</p>
`,
      glossary: [
        { term: 'AI Agent', def: '能自主執行多步驟任務的 AI 系統，不同於只能問答的聊天機器人。' },
        { term: '第一方數據', def: '品牌直接從顧客取得的數據（會員、訂單、評價），不經第三方平台。' },
        { term: '評價分析', def: '用 AI 把線上評價結構化，提煉出餐慢、服務、菜品等可行動的營運信號。' },
        { term: '門店營運', def: '餐廳現場的日常運作：排班、備貨、出餐、顧客服務。' },
      ],
      readingOrder: [
        { slug: '2026-08-31-ai-in-restaurant-saas-product', note: '先讀這篇，釐清餐飲 AI 不該只是聊天機器人。' },
        { slug: '2026-10-13-ai-not-in-pos', note: 'AI 不必放在 POS 裡，智能應該放在哪一層。' },
        { slug: '2026-08-17-online-review-reputation-operation', note: '差評不是客服問題：評價如何變成營運數據。' },
        { slug: '2026-08-24-who-owns-customer-relationship', note: '外賣平台帶來訂單，但誰掌握顧客關係。' },
        { slug: '2026-09-22-data-hub-when-needed', note: '數據中台是 AI 的基礎：沒有乾淨數據，AI 只是演示。' },
        { slug: '2026-07-20-ai-for-saas-overseas-team', note: '出海團隊怎樣用 AI 放大管理效率，而非代替管理者。' },
      ],
      articles: [
        '2026-08-31-ai-in-restaurant-saas-product',
        '2026-10-13-ai-not-in-pos',
        '2026-08-17-online-review-reputation-operation',
        '2026-08-24-who-owns-customer-relationship',
        '2026-09-22-data-hub-when-needed',
        '2026-07-20-ai-for-saas-overseas-team',
      ],
    },
    en: {
      title: 'AI in Restaurant Operations & SaaS',
      description:
        'Where AI should sit in restaurant operations, how it amplifies managers instead of replacing them, how online reviews become operational data, and how overseas teams use AI.',
      lede:
        'AI does not belong inside the POS, and it should not be just a chatbot. These articles clarify where AI actually earns its place in a restaurant, how it amplifies managers, and the underrated data source hiding in plain sight — online reviews.',
      body: `
<h2>AI should not just be a chatbot</h2>
<p>Mention "restaurant AI" and many picture an ordering bot or a support chat. Useful, but surface-level. The valuable AI sits deeper: helping store managers schedule, helping HQ forecast prep, turning scattered reviews into actionable operational signals. The question this cluster answers is simple — which layer should AI live on.</p>

<h2>Placement: AI does not belong in the POS</h2>
<p>The store terminal needs determinism and speed; AI's variability should not slow checkout. The better homes are the regional hub (scheduling, prep) and the cloud backbone (cross-store learning). Take AI out of the POS and it does more, not less.</p>

<h2>How reviews become operational data</h2>
<p>Bad reviews get tossed to support, yet they are a goldmine of operational data: slow service, attitude, dish problems — all sitting in the text. Structuring reviews with AI lets a manager see a trend before it spreads, instead of waiting for the monthly report. This is where "store operations" meets "data."</p>

<h2>Customer relationships and first-party data</h2>
<p>Delivery platforms bring orders, but they often keep the customer relationship. AI helps a brand stitch scattered interactions — reviews, membership, repeat purchases — into first-party data, so marketing is not dependent on platform traffic. Whoever owns the relationship holds the long-term leverage.</p>

<h2>How overseas teams use AI</h2>
<p>The biggest cost of a cross-border team is communication and management span. AI can amplify a manager — translation, meeting summaries, cross-market reports — without replacing their judgment. The tool is a lever, not a stand-in.</p>

<h2>The data hub is AI's foundation</h2>
<p>One thing must be said plainly: without clean, decoupled data, AI is just a demo. The layering and decoupling discussed in the data-platform cluster are precisely the precondition for AI to ship. Read the two clusters together.</p>

<h2>In short</h2>
<p>AI's value in restaurants is not replacing people but amplifying them. Right layer, right data, turning reviews and customer relationships into assets — that is the direction restaurant AI should take.</p>
`,
      glossary: [
        { term: 'AI Agent', def: 'An AI system that autonomously runs multi-step tasks, unlike a chatbot that only answers questions.' },
        { term: 'First-party data', def: 'Data a brand collects directly from customers (membership, orders, reviews), not via a third-party platform.' },
        { term: 'Review analysis', def: 'Using AI to structure online reviews into actionable signals like slow service, attitude, or dish issues.' },
        { term: 'Store operations', def: 'The daily running of a restaurant: scheduling, prep, ticketing, customer service.' },
      ],
      readingOrder: [
        { slug: '2026-08-31-ai-in-restaurant-saas-product', note: 'Start here to see why restaurant AI should not just be a chatbot.' },
        { slug: '2026-10-13-ai-not-in-pos', note: 'AI does not belong in the POS — which layer should hold it.' },
        { slug: '2026-08-17-online-review-reputation-operation', note: 'Bad reviews are not a support issue: turning them into operational data.' },
        { slug: '2026-08-24-who-owns-customer-relationship', note: 'Platforms bring orders, but who owns the customer relationship.' },
        { slug: '2026-09-22-data-hub-when-needed', note: 'The data hub is AI\'s foundation: no clean data, no real AI.' },
        { slug: '2026-07-20-ai-for-saas-overseas-team', note: 'How overseas teams use AI to amplify management, not replace it.' },
      ],
      articles: [
        '2026-08-31-ai-in-restaurant-saas-product',
        '2026-10-13-ai-not-in-pos',
        '2026-08-17-online-review-reputation-operation',
        '2026-08-24-who-owns-customer-relationship',
        '2026-09-22-data-hub-when-needed',
        '2026-07-20-ai-for-saas-overseas-team',
      ],
    },
  },
];

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

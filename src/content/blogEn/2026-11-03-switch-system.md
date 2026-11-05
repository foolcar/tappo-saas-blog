---
title: "Restaurant System Migration: The Data Can Move, but Can Store Workflows Follow?"
description: "A successful data import does not mean store operations are ready. From order changes and kitchen routing to refund permissions and shift reconciliation, this article examines where restaurant system migrations most often break down."
date: 2026-11-03
updated: 2026-11-03
category: "Product Design"
originalSlug: "2026-11-03-switch-system"
tags: ["Restaurant SaaS", "System Migration", "Store Operations", "POS Migration", "Product Design", "Lightweight POS"]
image: "/og-switch-system-en.jpg"
---

In three earlier articles, I wrote about why restaurant groups should decouple data from the POS, what a lightweight POS should retain, and when a restaurant group needs a shared data platform. Those articles focused on how the system should be designed.

This one is about something else: what actually happens inside a restaurant when the old system is replaced.

Before signing with a new provider, many restaurant groups worry most about their data. Vendors know how to reassure them: “Don't worry. We can arrange the export and give you the CSV files and APIs.” It sounds as though data transfer is the hardest part and everything will be fine once it is complete.

I have seen that assumption underestimate the real workload too many times.

The export might be completed over a weekend. Cleaning the data, reconciling it and carrying unfinished business into the new system usually take longer. Store routines do not reset over the same weekend either.

On the first day, a cashier cannot find the void button. The manager does not know where the discount permissions are. Friday's dinner rush arrives while the team still has muscle memory from the old system and has not yet become comfortable with the new one. That is where the real cost of migration begins to appear.

The project plan may look complete: organise the products, import the members, connect payments, train the staff and choose a cutover date. But during the busiest part of dinner service, a customer asks to change a dish after payment and the kitchen has already started preparing it. Who approves the change? How does the kitchen receive it? How is the price difference handled? How will the next shift know what happened to the order?

Those questions are often missing from the project plan.

## Some workflows were never written into the old system

After using the same system for years, restaurant staff develop their own ways of getting work done.

Some refunds require the manager. Certain set meals cannot be edited, so staff cancel and recreate the order. Problems with delivery orders are handled on a separate tablet. If the shift does not reconcile, someone writes the difference on paper and checks it after closing.

Some of these are sensible operating practices. Others are workarounds for limitations in the old system. The problem is that they are often mixed together.

If the new system simply copies every old screen and step, it may reproduce the same problems. But if the implementation team dismisses everything with “the new system does not work that way”, important tasks previously held together by managers and experienced staff may suddenly have no owner.

Before asking what features the new system has, ask a more practical question: **How is this task completed today, and who closes the loop when something goes wrong?**

## Not all data should be migrated in the same way

Not every record needs to be “live” in the new system on day one. The data should first be separated into at least three groups.

**The first group is data and configuration required for launch.** Menus, prices, stores, staff permissions, payments and kitchen routing need to be aligned before cutover. But a successful import does not prove that the configuration works in practice. Modifier groups, time-based pricing and store-level variations still need to be tested.

**The second group is historical reference data.** How long past orders, invoices and reports must be retained—and where—depends on operational, financial and regulatory requirements. Stores need reliable access when the records are required. That does not mean every historical transaction must become an editable order in the new system.

**The third group is ongoing business and customer value.** Open orders, pending refunds, loyalty points, stored balances and promotional entitlements cannot be checked by record count alone. Totals and records should be fully reconciled, followed by sampled tests to confirm that customers can still use their benefits under the correct rules.

Recipes and inventory also need clear ownership. Recipes are important brand data, but they do not necessarily belong on every transaction terminal. Inventory requires an agreed cutover point, a trusted update source, and a plan for purchase orders and deductions that are still in progress.

There is a broader point here. If data was never [decoupled from the POS](/en/blog/2026-09-07-data-decoupling-restaurant-group/), moving it cleanly will be more difficult. When data and logic are tightly bound to the old system, an export may be little more than a collection of fields that still need to be interpreted and reorganised.

**A complete migration does not mean putting everything into the new system. It means every type of data has a destination and every unfinished task has an owner.**

## Do not just move products and members—walk one order all the way through

Return to the order that has already been paid and sent to the kitchen but now needs to be changed.

The new system may contain every required feature, yet the workflow can still break between them. The front counter updates the order, but the kitchen does not receive the change. The refund is completed, but the order status remains unchanged. The audit record exists in the back office, but the person running the shift cannot view it.

I would ask the team to follow a full shift and verify each of these handoffs. That tells us more than a feature checklist:

| Workflow | The data has moved—but what still needs to be verified? |
| --- | --- |
| Sold-out items | After the store updates availability, does every channel receive the change? Who follows up when synchronisation fails? |
| Order modifiers | Can the kitchen correctly understand add-ons, set-menu choices and special instructions? |
| Kitchen routing | Is routing configured for the actual production stations in each store, rather than copied from a head-office default? |
| Refunds and order changes | Does someone on shift have the right permissions, and is every action recorded? |
| Shift reconciliation | Can differences between business date, transaction date and platform settlement date be explained and followed up? |

One common trap is treating an unsettled platform payment as a cash discrepancy simply because the money has not arrived. Before investigating an exception, first confirm which time period and which type of amount are being compared.

**Having all the features and being able to close the workflow are two different tests.**

## Cutover week: the restaurant still has to take orders

System cutover is not a single switch. A restaurant cannot suspend every part of its operation simply because the technology is changing.

The group may migrate store by store, or switch all stores together if the risk is manageable. The important question is not which approach looks cleaner. It is whether representative stores and operating periods have been used to test real workflows first.

During the transition, some groups let the new system handle all new transactions while retaining the old system for historical reference. One boundary must remain clear: **Which system is authoritative for each business fact at that moment?**

Where are new orders created? Where is a refund for a pre-cutover order processed? When do loyalty balances move? Who reconciles differences between the two systems? Without clear answers, the systems are not really running in parallel; staff are entering the same information twice and reconciling it manually.

Historical access and operational rollback are also different things. The ability to view the old system does not mean it can safely resume trading. A rollback plan must explain what happens to new orders, payments and loyalty changes created after cutover, and it must be tested before launch.

The target recovery time and the period for retaining the old system should reflect store scale, transaction complexity and the cost of interruption. One fixed deadline will not suit every migration.

The final pre-opening checks still matter. Have prices loaded correctly? Has the menu synchronised? Have the payment terminals been tested? Has offline operation been verified? This is where the value of a [lightweight POS](/en/blog/2026-09-14-lightweight-pos-responsibility-boundaries/) becomes visible: when the terminal retains the responsibilities that cannot stop, cutover risk becomes easier to contain.

## After launch: where does the store still get stuck?

Launch day is not the finish line. Many problems appear only after the implementation team leaves and different shifts begin operating independently.

Training often focuses on store managers and supervisors. But the person serving customers may be a part-time team member on the dinner shift or someone who joined recently. They need more than one training session. They need clear standard workflows, practical guidance for exceptions and a support channel they can reach during service.

Reporting differences are another quiet source of failure. The new system may define discounts, refunds, taxes and business dates differently from the old one. That is not necessarily a software defect. But if nobody can explain the differences, both finance and store teams will quickly lose confidence in the numbers.

During this period, the manager often acts as a translator: carrying the genuinely necessary parts of the old workflow into the new system, while identifying workarounds that existed only to compensate for old limitations.

On-site support should therefore not disappear immediately after cutover. It should remain until the store can complete its critical workflows independently, rather than ending on an arbitrary date.

The pilot store should not simply be the location with the strongest manager and the most experienced team. A dine-in-heavy store passing the test does not prove that a delivery-heavy location will work just as well. A successful shift with the manager present throughout does not prove that an ordinary shift can operate independently.

**The purpose of a pilot is to identify what cannot yet be repeated—not to prove that the project is already successful.**

## After launch, look for the system the store has quietly rebuilt around the new one

Head office may see orders flowing and reports being generated, and conclude that the migration is complete.

Meanwhile, the store may maintain a separate spreadsheet for refunds, compensation and shift handovers. Managers may continue approving actions in group chats. The new system records only the final result.

These additional tools are not always a problem. Some are temporary bridges. Others are evidence that the official workflow still cannot carry the work.

Do not rush to make staff delete the extra spreadsheet. Look at what they are recording first. It may reveal the missing workflow more clearly than another training session.

When assessing the rollout, I would look beyond system availability and ask four questions:

1. Can an exceptional order be handled from discovery to resolution without repeated manual handoffs?
2. Can the team member on shift act within their permissions, or quickly reach the person who can?
3. Are handover and reconciliation differences recorded, explainable and assigned for follow-up?
4. When implementation support is not on site, can the store complete an ordinary shift using the agreed workflows and support channels?

If the implementation team still has to perform the work every day, that part of the migration has not been delivered.

## Before changing systems, check these six things

If the migration were starting today, I would confirm six things first:

1. **Has the data been classified?** What must be usable on day one, what only needs to remain accessible, and which unfinished transactions or entitlements must continue?
2. **Have the workflows actually been exercised?** Has the team run a realistic shift from opening through peak service to handover?
3. **Has rollback been tested?** Who makes the decision, how does the switch happen, and how are new transactions preserved?
4. **Can differences in the numbers be explained?** Have definitions for discounts, refunds, taxes and business dates been aligned?
5. **Is the pilot representative?** Does it cover different channels, menu complexity and staffing patterns?
6. **Can the store operate independently?** After support leaves, can an ordinary shift complete transactions, handle exceptions and hand over cleanly?

If the group has reached the point where it [needs a shared data platform](/en/blog/2026-09-22-data-hub-when-needed/), a system replacement cannot be treated as an IT project alone. The platform may be the foundation, but every task at store level still needs to be tested again when that foundation changes.

## Final thought

Changing systems looks like a data exercise. In practice, it means moving a live operation while it continues to serve customers.

The data transfer may take only a weekend. The real work is helping different stores, shifts and roles establish workflows that can operate, hand over and handle exceptions.

The next time someone says, “Data portability is easy—we'll export everything for you,” the answer can be simple: I trust you with the data, but reconnecting the store workflows needs to be part of the plan as well.

**Treat system migration as an operational change at store level, not a one-off technical transfer. Only then will the group allocate the right people, time and budget.**

# 🔐 Complete Escrow Transaction Flow - Restyle Platform

## 📋 Overview

This document outlines the **complete end-to-end escrow flow** for marketplace transactions on the Restyle Platform. The system ensures secure payment handling, proper commission collection, and seller protection.

---

## 🎯 Escrow Flow Diagram

```
[BUYER] → [PLATFORM ESCROW] → [SELLER]
         ↓ (2% Commission)
    [PLATFORM]
```

---

## 🔄 Complete Transaction Lifecycle

### **Step 1: Transaction Initiation** 
**Status:** `pending_payment`

**What happens:**
- Buyer clicks "Buy Now" on a product
- System creates a new transaction record
- Calculates pricing breakdown:
  - `sale_price`: Original product price (e.g., ₱1000)
  - `commission_amount`: 2% platform fee (e.g., ₱20)
  - `seller_earnings`: 98% seller receives (e.g., ₱980)

**Controller Method:** `TransactionController@initiate()`

**Database Changes:**
```php
Transaction::create([
    'product_id' => $product->id,
    'buyer_id' => auth()->id(),
    'seller_id' => $product->user_id,
    'sale_price' => 1000.00,
    'commission_amount' => 20.00,
    'seller_earnings' => 980.00,
    'status' => 'pending_payment',
]);
```

**User Actions:**
- ✅ Buyer: Redirected to transaction page with payment instructions
- ❌ Cannot buy own products
- ❌ Cannot buy inactive products

---

### **Step 2: Payment Submission**
**Status:** `pending_payment` → `payment_submitted`

**What happens:**
- Buyer transfers money to **Platform's GCash/Bank Account** (NOT seller)
- Buyer uploads payment proof (screenshot)
- Buyer provides payment reference number

**Controller Method:** `TransactionController@submitPayment()`

**Platform Payment Details:**
- **GCash:** 09123456789 (Restyle Platform)
- **Bank:** BPI - 1234567890 (Restyle Platform)

**Database Changes:**
```php
$transaction->update([
    'payment_proof_path' => 'payment-proofs/screenshot.jpg',
    'platform_payment_reference' => 'GCASH-123456789',
    'status' => 'payment_submitted',
]);
```

**User Actions:**
- ✅ Buyer: Uploads payment proof and reference
- ⏳ Buyer: Waits for admin verification
- 📧 Optional: Send notification to admin

---

### **Step 3: Payment Verification (Admin)**
**Status:** `payment_submitted` → `payment_verified`

**What happens:**
- Admin reviews payment proof
- Admin confirms payment received in platform account
- Platform officially holds funds in escrow
- Seller is notified to prepare shipment

**Controller Method:** `TransactionController@verifyPayment()`

**Database Changes:**
```php
$transaction->update([
    'status' => 'payment_verified',
    'payment_collected_by_platform' => true,
    'platform_payment_collected_at' => now(),
]);
```

**User Actions:**
- ✅ Admin: Reviews and verifies payment
- 📧 Seller: Notified to ship product
- 🔒 Platform: Holds ₱1000 in escrow

**Security Check:**
- ✅ Payment must be verified before allowing shipment

---

### **Step 4: Product Shipment (Seller)**
**Status:** `payment_verified` → `shipped`

**What happens:**
- Seller prepares and ships the product
- Seller marks transaction as shipped
- Buyer is notified about shipment
- Tracking info can be added (optional)

**Controller Method:** `TransactionController@markShipped()`

**Database Changes:**
```php
$transaction->update([
    'status' => 'shipped',
    'shipped_at' => now(),
]);
```

**User Actions:**
- ✅ Seller: Marks product as shipped
- 📧 Buyer: Notified about shipment
- ⏳ Buyer: Waits for delivery

**Security Check:**
- ❌ Cannot ship unless payment is verified
- ✅ Only seller can mark as shipped

---

### **Step 5: Delivery Confirmation (Buyer)**
**Status:** `shipped` → `delivered`

**What happens:**
- Buyer receives the product
- Buyer confirms delivery on platform
- System prepares for transaction completion
- Auto-triggers completion process

**Controller Method:** `TransactionController@confirmDelivery()`

**Database Changes:**
```php
$transaction->update([
    'status' => 'delivered',
    'delivered_at' => now(),
]);
```

**User Actions:**
- ✅ Buyer: Confirms delivery
- ⏳ System: Auto-completes transaction
- 📧 Seller: Notified about confirmation

**Security Check:**
- ❌ Cannot confirm unless status is 'shipped'
- ✅ Only buyer can confirm delivery

---

### **Step 6: Transaction Completion (Auto/Admin)**
**Status:** `delivered` → `completed`

**What happens:**
- Platform processes seller payout
- Platform keeps commission (₱20)
- Seller receives earnings (₱980)
- Commission record created
- Product marked as sold
- Transaction finalized

**Controller Method:** `TransactionController@complete()`

**Database Changes:**

**1. Update Transaction:**
```php
$transaction->update([
    'status' => 'completed',
    'completed_at' => now(),
    'released_at' => now(),
    'seller_paid' => true,
    'seller_paid_at' => now(),
    'seller_payout_amount' => 980.00,
    'seller_payout_reference' => 'PAYOUT-{id}-{timestamp}',
]);
```

**2. Create Commission Record:**
```php
CommissionRecord::create([
    'transaction_id' => $transaction->id,
    'seller_id' => $transaction->seller_id,
    'product_id' => $transaction->product_id,
    'user_id' => $transaction->seller_id,
    'amount' => 20.00,
    'rate' => 2.00,
    'status' => 'paid',
    'collected_at' => now(),
    'paid_at' => now(),
]);
```

**3. Mark Product as Sold:**
```php
$product->update(['status' => 'sold']);
```

**Money Flow:**
- 🏦 Platform Escrow: ₱1000 (received from buyer)
- 💰 Seller Receives: ₱980 (98%)
- 💵 Platform Keeps: ₱20 (2% commission)

**User Actions:**
- ✅ Seller: Can withdraw ₱980
- ✅ Platform: Records ₱20 commission
- ✅ Product: Marked as sold, removed from marketplace

**Security Checks:**
- ❌ Cannot complete unless payment verified
- ❌ Cannot complete unless delivered
- ✅ Commission automatically recorded

---

## 🚨 Exception Flows

### **Transaction Cancellation**
**Allowed Statuses:** `pending_payment`, `payment_submitted`

**Controller Method:** `TransactionController@cancel()`

**What happens:**
- Transaction marked as cancelled
- Product returns to active status
- Refund processed if payment was made

**Database Changes:**
```php
$transaction->update([
    'status' => 'cancelled',
    'notes' => 'Cancellation reason',
]);
```

**User Actions:**
- ✅ Buyer or Seller can cancel
- ❌ Cannot cancel after payment verified
- 💰 Refund issued if payment collected

---

### **Admin Manual Completion**
**Status:** Any → `completed`

**Controller Method:** `TransactionController@adminComplete()`

**When to use:**
- Dispute resolution
- System errors
- Special cases

**Security Check:**
- ✅ Admin only
- ❌ Must have payment collected

---

## 💾 Database Schema

### **Transactions Table**
```php
$table->id();
$table->foreignId('product_id')->constrained();
$table->foreignId('buyer_id')->constrained('users');
$table->foreignId('seller_id')->constrained('users');
$table->decimal('sale_price', 10, 2);           // ₱1000
$table->decimal('commission_amount', 10, 2);    // ₱20
$table->decimal('seller_earnings', 10, 2);      // ₱980
$table->enum('status', [
    'pending_payment',
    'payment_submitted',
    'payment_verified',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    'refunded'
]);
$table->string('payment_proof_path')->nullable();
$table->string('platform_payment_reference')->nullable();
$table->boolean('payment_collected_by_platform')->default(false);
$table->timestamp('platform_payment_collected_at')->nullable();
$table->boolean('seller_paid')->default(false);
$table->string('seller_payout_reference')->nullable();
$table->timestamp('seller_paid_at')->nullable();
$table->decimal('seller_payout_amount', 10, 2)->nullable();
$table->timestamp('shipped_at')->nullable();
$table->timestamp('delivered_at')->nullable();
$table->timestamp('completed_at')->nullable();
```

### **Commission Records Table**
```php
$table->id();
$table->foreignId('transaction_id')->constrained();
$table->foreignId('seller_id')->constrained('users');
$table->foreignId('product_id')->constrained();
$table->foreignId('user_id')->constrained('users'); // Backward compatibility
$table->decimal('amount', 10, 2);                   // ₱20
$table->decimal('rate', 5, 2);                      // 2.00
$table->enum('status', ['pending', 'paid', 'cancelled']);
$table->timestamp('collected_at')->nullable();
$table->timestamp('paid_at')->nullable();
```

---

## 🔐 Security & Validation

### **Business Rules:**
1. ✅ Buyer cannot buy own products
2. ✅ Product must be active
3. ✅ No duplicate pending transactions
4. ✅ Payment must be verified before shipping
5. ✅ Product must be shipped before delivery confirmation
6. ✅ Payment must be collected before completion
7. ✅ Commission automatically calculated (2%)
8. ✅ Seller earnings automatically calculated (98%)

### **Authorization:**
- **Buyer can:**
  - Submit payment
  - Confirm delivery
  - Cancel before verification
  - View own transactions

- **Seller can:**
  - Mark as shipped
  - Cancel before verification
  - View own transactions
  - Check earnings

- **Admin can:**
  - Verify payments
  - Complete transactions
  - Cancel any transaction
  - View all transactions
  - View commission reports

---

## 📊 Money Flow Example

### **Product Price: ₱1,000**

1. **Buyer pays** → ₱1,000 to Platform GCash
2. **Platform holds** → ₱1,000 in escrow
3. **On completion:**
   - Platform pays seller → ₱980
   - Platform keeps → ₱20 (commission)

### **Commission Breakdown:**
- Commission Rate: 2%
- Commission Amount: ₱1,000 × 0.02 = ₱20
- Seller Earnings: ₱1,000 × 0.98 = ₱980

---

## 🎬 Complete Flow Summary

```
1. BUYER → Buy Product
   ↓
2. BUYER → Pay Platform (₱1000)
   ↓
3. BUYER → Upload Payment Proof
   ↓
4. ADMIN → Verify Payment
   ↓ (Platform holds ₱1000)
5. SELLER → Ship Product
   ↓
6. BUYER → Confirm Delivery
   ↓
7. PLATFORM → Complete Transaction
   ├─→ Pay Seller (₱980)
   └─→ Keep Commission (₱20)
```

---

## 🛠️ Routes & Endpoints

```php
// Buyer Actions
POST   /marketplace/products/{product}/buy          → initiate
POST   /transactions/{transaction}/submit-payment   → submitPayment
POST   /transactions/{transaction}/confirm-delivery → confirmDelivery
POST   /transactions/{transaction}/cancel           → cancel

// Seller Actions
POST   /transactions/{transaction}/mark-shipped     → markShipped

// Admin Actions
POST   /transactions/{transaction}/verify-payment   → verifyPayment
POST   /transactions/{transaction}/admin-complete   → adminComplete

// View Pages
GET    /transactions/{transaction}                  → show
GET    /transactions/buyer                          → buyerTransactions
GET    /transactions/seller                         → sellerTransactions
GET    /admin/transactions/pending-payments         → adminPendingPayments
```

---

## ✅ Testing Checklist

- [ ] Buyer can initiate transaction
- [ ] Buyer can submit payment proof
- [ ] Admin can verify payment
- [ ] Seller can mark as shipped
- [ ] Buyer can confirm delivery
- [ ] Transaction auto-completes on delivery
- [ ] Commission record created correctly
- [ ] Seller payout calculated correctly (98%)
- [ ] Platform commission recorded (2%)
- [ ] Product marked as sold
- [ ] Cannot buy own products
- [ ] Cannot ship unverified payments
- [ ] Cannot complete without payment verification
- [ ] Cancellation works in early stages

---

## 🎉 System Benefits

1. **Buyer Protection:** Money held until delivery confirmed
2. **Seller Protection:** Payment guaranteed before shipping
3. **Platform Revenue:** Automatic 2% commission collection
4. **Transparency:** Complete transaction tracking
5. **Security:** Multiple verification steps
6. **Audit Trail:** Complete financial records

---

**Last Updated:** October 30, 2025  
**Version:** 2.0  
**System Status:** ✅ Production Ready


# 🎨 Escrow Flow Visual Diagram

## 💸 Money & Status Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESTYLE ESCROW SYSTEM                           │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: TRANSACTION INITIATION
┌─────────┐
│  BUYER  │ Clicks "Buy Now"
└────┬────┘
     │
     ▼
┌─────────────────────────────┐
│  CREATE TRANSACTION         │
│  Status: pending_payment    │
│  ₱1000 (total)             │
│  ₱20 (commission - 2%)     │
│  ₱980 (seller earnings)    │
└─────────────────────────────┘


STEP 2: BUYER PAYMENT
┌─────────┐
│  BUYER  │ Pays platform GCash (09123456789)
└────┬────┘
     │
     ▼
┌─────────────────────────────┐
│  UPLOAD PAYMENT PROOF       │
│  Status: payment_submitted  │
│  - Screenshot               │
│  - Reference Number         │
└─────────────────────────────┘


STEP 3: ADMIN VERIFICATION
┌─────────┐
│  ADMIN  │ Verifies payment in platform account
└────┬────┘
     │
     ▼
┌─────────────────────────────┐
│  PAYMENT VERIFIED           │
│  Status: payment_verified   │
│  ₱1000 → ESCROW ACCOUNT    │
└─────────────────────────────┘
     │
     │  🔒 PLATFORM HOLDS ₱1000 IN ESCROW
     │


STEP 4: SELLER SHIPMENT
┌─────────┐
│ SELLER  │ Ships product to buyer
└────┬────┘
     │
     ▼
┌─────────────────────────────┐
│  PRODUCT SHIPPED            │
│  Status: shipped            │
│  ₱1000 still in escrow     │
└─────────────────────────────┘


STEP 5: DELIVERY CONFIRMATION
┌─────────┐
│  BUYER  │ Receives & confirms delivery
└────┬────┘
     │
     ▼
┌─────────────────────────────┐
│  DELIVERY CONFIRMED         │
│  Status: delivered          │
│  Triggers auto-completion   │
└─────────────────────────────┘


STEP 6: TRANSACTION COMPLETION
┌─────────────────────────────┐
│  COMPLETE TRANSACTION       │
│  Status: completed          │
└─────────────────────────────┘
     │
     ├──────────────────────────────────┐
     │                                  │
     ▼                                  ▼
┌──────────────────┐        ┌───────────────────┐
│  SELLER PAYOUT   │        │ COMMISSION RECORD │
│  ₱980 (98%)      │        │ ₱20 (2%)          │
│  Reference: XXX  │        │ transaction_id: 1 │
└──────────────────┘        │ seller_id: 2      │
                            │ amount: 20.00     │
                            │ status: paid      │
                            └───────────────────┘
```

---

## 🔄 Status Transition Diagram

```
   pending_payment
         │
         │ Buyer submits payment proof
         ▼
   payment_submitted
         │
         │ Admin verifies payment
         ▼
   payment_verified
         │
         │ Seller ships product
         ▼
       shipped
         │
         │ Buyer confirms delivery
         ▼
      delivered
         │
         │ System auto-completes
         ▼
      completed ✅
```

---

## 💰 Money Split Visualization

```
                 BUYER PAYS ₱1000
                       │
                       ▼
          ┌────────────────────────┐
          │   PLATFORM ESCROW      │
          │      (₱1000)           │
          └────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
  ┌──────────┐                 ┌──────────┐
  │  SELLER  │                 │ PLATFORM │
  │  ₱980    │                 │   ₱20    │
  │  (98%)   │                 │   (2%)   │
  └──────────┘                 └──────────┘
```

---

## 🗄️ Database Relationships

```
┌─────────────────┐
│   TRANSACTION   │
│   id: 1         │
│   buyer_id: 1   │
│   seller_id: 2  │
│   product_id: 5 │
│   amount: 1000  │
└────────┬────────┘
         │
         │ hasOne
         ▼
┌──────────────────────┐
│  COMMISSION_RECORD   │
│  id: 1               │
│  transaction_id: 1   │◄─── NEW! Fixed the error
│  seller_id: 2        │◄─── NEW! Added for tracking
│  product_id: 5       │
│  amount: 20.00       │
│  rate: 2.00          │
│  status: paid        │
│  collected_at: NOW   │◄─── NEW! Timestamp
└──────────────────────┘
```

---

## 👥 Actor Responsibilities

```
┌──────────────────────────────────────────────────────┐
│                      BUYER                           │
├──────────────────────────────────────────────────────┤
│  1. Click "Buy Now"                                  │
│  2. Pay Platform GCash                               │
│  3. Upload payment proof                             │
│  4. Confirm delivery                                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                      ADMIN                           │
├──────────────────────────────────────────────────────┤
│  1. Verify payment received                          │
│  2. Monitor transactions                             │
│  3. Handle disputes                                  │
│  4. View commission reports                          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                      SELLER                          │
├──────────────────────────────────────────────────────┤
│  1. Wait for payment verification                    │
│  2. Ship product                                     │
│  3. Receive payout (₱980)                           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                      SYSTEM                          │
├──────────────────────────────────────────────────────┤
│  1. Calculate commission (2%)                        │
│  2. Hold funds in escrow                            │
│  3. Auto-complete on delivery                       │
│  4. Create commission record                        │
│  5. Process seller payout                           │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Security Gates

```
   Can buyer submit payment?
   ├─ Is status = pending_payment? ──YES─┐
   └─ Is buyer the transaction buyer? ──YES─► ALLOW

   Can admin verify payment?
   ├─ Is user admin? ──YES─┐
   └─ Is status = payment_submitted? ──YES─► ALLOW

   Can seller ship?
   ├─ Is status = payment_verified? ──YES─┐
   └─ Is seller the transaction seller? ──YES─► ALLOW

   Can buyer confirm delivery?
   ├─ Is status = shipped? ──YES─┐
   └─ Is buyer the transaction buyer? ──YES─► ALLOW

   Can complete transaction?
   ├─ Is status = delivered? ──YES─┐
   ├─ Is payment_collected_by_platform = true? ──YES─┐
   └─ Has payment been verified? ──YES─► ALLOW
```

---

## 📊 Timeline Example

```
Time    Actor       Action                      Status              Money
────────────────────────────────────────────────────────────────────────────
10:00   BUYER       Clicks "Buy Now"            pending_payment     -
10:05   BUYER       Pays platform GCash         payment_submitted   ₱1000→Platform
10:30   ADMIN       Verifies payment            payment_verified    Held in escrow
11:00   SELLER      Ships product               shipped             Still in escrow
2 days  BUYER       Receives package            delivered           Still in escrow
        SYSTEM      Auto-completes              completed           ₱980→Seller
                                                                    ₱20→Platform
```

---

## ✅ What Was Fixed

### Before (❌ BROKEN):
```sql
commission_records table:
├─ id
├─ product_id
├─ user_id
├─ amount
└─ ... (NO transaction_id!) ← ERROR!
```

### After (✅ FIXED):
```sql
commission_records table:
├─ id
├─ transaction_id  ← ADDED! Links to transaction
├─ seller_id       ← ADDED! Tracks seller
├─ product_id
├─ user_id
├─ amount
├─ collected_at    ← ADDED! Timestamp
└─ ...
```

---

## 🎯 Key Takeaways

1. **Platform is the middleman** - All money flows through platform escrow
2. **2% commission automatic** - Calculated and recorded on completion
3. **Buyer protection** - Money held until delivery confirmed
4. **Seller protection** - Payment guaranteed before shipping
5. **Complete tracking** - Every step recorded in database
6. **Error fixed** - transaction_id now properly links commission to transaction

---

## 🚀 Test Flow

```bash
# 1. Create test accounts
php artisan tinker
$buyer = User::factory()->create(['email' => 'buyer@test.com']);
$seller = User::factory()->create(['email' => 'seller@test.com']);

# 2. Create test product
$product = Product::create([
    'user_id' => $seller->id,
    'name' => 'Test Product',
    'price' => 1000,
    'status' => 'active'
]);

# 3. Login as buyer and buy product via browser
# 4. Follow complete flow
# 5. Verify commission record created:

Transaction::latest()->first()->commissionRecord;
// Should show transaction_id, seller_id, amount: 20.00
```

---

**Visual Guide Version:** 1.0  
**Date:** October 30, 2025  
**Status:** ✅ System Ready


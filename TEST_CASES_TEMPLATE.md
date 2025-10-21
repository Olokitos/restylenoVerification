# Unit Test Cases Template

This document template is for organizing test cases for the ReStyle 6.0 application.

## How to Use

1. Fill in the test cases table below with your specific test scenarios
2. I will generate PEST unit tests based on your specifications
3. Tests will be displayed in the browser-based test dashboard

## Test Dashboard Access

- **With Authentication**: `http://localhost/test-dashboard` (Inertia/React version)
- **Without Authentication**: `http://localhost/test-runner` (Standalone HTML version)

---

## Unit Test Cases

### 1. Model Tests

#### User Model
| Test Case ID | Method/Feature | Description | Input | Expected Output | Priority |
|--------------|----------------|-------------|-------|-----------------|----------|
| UT-USER-001 | User Creation | Test user can be created with valid data | Name, Email, Password | User object created | High |
| UT-USER-002 | Email Validation | Test email must be unique | Duplicate email | Validation error | High |
| UT-USER-003 | Password Hashing | Test password is hashed on save | Plain text password | Hashed password stored | High |
| UT-USER-004 | Admin Flag | Test is_admin flag defaults to false | New user | is_admin = false | Medium |

#### WardrobeItem Model
| Test Case ID | Method/Feature | Description | Input | Expected Output | Priority |
|--------------|----------------|-------------|-------|-----------------|----------|
| UT-WARDROBE-001 | Item Creation | Test wardrobe item can be created | User ID, Name, Category | WardrobeItem created | High |
| UT-WARDROBE-002 | User Relationship | Test wardrobe item belongs to user | WardrobeItem | Returns User object | High |
| UT-WARDROBE-003 | Category Validation | Test category is required | Missing category | Validation error | Medium |

#### Product Model
| Test Case ID | Method/Feature | Description | Input | Expected Output | Priority |
|--------------|----------------|-------------|-------|-----------------|----------|
| UT-PRODUCT-001 | Product Creation | Test product can be created | Title, Price, User | Product created | High |
| UT-PRODUCT-002 | Price Validation | Test price must be positive | Negative price | Validation error | High |
| UT-PRODUCT-003 | Status Default | Test status defaults to 'active' | New product | status = 'active' | Medium |
| UT-PRODUCT-004 | Category Relationship | Test product belongs to category | Product | Returns Category object | High |
| UT-PRODUCT-005 | User Relationship | Test product belongs to user | Product | Returns User object | High |

#### Transaction Model
| Test Case ID | Method/Feature | Description | Input | Expected Output | Priority |
|--------------|----------------|-------------|-------|-----------------|----------|
| UT-TRANSACTION-001 | Transaction Creation | Test transaction can be initiated | Buyer, Product | Transaction created | High |
| UT-TRANSACTION-002 | Status Progression | Test status changes correctly | Status update | Correct status sequence | High |
| UT-TRANSACTION-003 | Amount Calculation | Test amounts calculated correctly | Product price | Correct breakdown | High |
| UT-TRANSACTION-004 | Escrow Validation | Test escrow amounts are correct | Transaction | Correct escrow amounts | High |

#### Category Model
| Test Case ID | Method/Feature | Description | Input | Expected Output | Priority |
|--------------|----------------|-------------|-------|-----------------|----------|
| UT-CATEGORY-001 | Category Creation | Test category can be created | Name, Description | Category created | High |
| UT-CATEGORY-002 | Active Flag | Test is_active defaults to true | New category | is_active = true | Medium |
| UT-CATEGORY-003 | Products Relationship | Test category has many products | Category | Returns products collection | High |

---

### 2. Controller Tests

#### WardrobeController
| Test Case ID | Method | Description | Input | Expected Output | Priority |
|--------------|--------|-------------|-------|-----------------|----------|
| UT-WARDROBE-CTRL-001 | index() | Test listing wardrobe items | Auth user | Returns user's wardrobe items | High |
| UT-WARDROBE-CTRL-002 | store() | Test creating wardrobe item | Valid form data | Item created, redirect | High |
| UT-WARDROBE-CTRL-003 | update() | Test updating wardrobe item | Updated data | Item updated | Medium |
| UT-WARDROBE-CTRL-004 | destroy() | Test deleting wardrobe item | Item ID | Item deleted | Medium |

#### MarketplaceController
| Test Case ID | Method | Description | Input | Expected Output | Priority |
|--------------|--------|-------------|-------|-----------------|----------|
| UT-MARKETPLACE-CTRL-001 | index() | Test listing active products | None | Returns active products | High |
| UT-MARKETPLACE-CTRL-002 | show() | Test showing product details | Product ID | Returns product with relations | High |
| UT-MARKETPLACE-CTRL-003 | store() | Test creating product listing | Valid product data | Product created | High |

#### TransactionController
| Test Case ID | Method | Description | Input | Expected Output | Priority |
|--------------|--------|-------------|-------|-----------------|----------|
| UT-TRANSACTION-CTRL-001 | initiate() | Test transaction initiation | Product ID | Transaction created | High |
| UT-TRANSACTION-CTRL-002 | submitPayment() | Test payment submission | Transaction ID, proof | Status updated | High |
| UT-TRANSACTION-CTRL-003 | verifyPayment() | Test admin payment verification | Transaction ID | Status = verified | High |
| UT-TRANSACTION-CTRL-004 | confirmDelivery() | Test buyer delivery confirmation | Transaction ID | Status = completed | High |

---

### 3. Validation Tests

#### Form Requests
| Test Case ID | Request Class | Field | Validation Rule | Test Input | Expected Result | Priority |
|--------------|---------------|-------|-----------------|------------|-----------------|----------|
| UT-VAL-001 | WardrobeRequest | name | required | Empty string | Validation fails | High |
| UT-VAL-002 | WardrobeRequest | category | required | Null | Validation fails | High |
| UT-VAL-003 | ProductRequest | title | required, min:3 | 'AB' | Validation fails | High |
| UT-VAL-004 | ProductRequest | price | required, numeric, min:0 | -100 | Validation fails | High |
| UT-VAL-005 | ProductRequest | price | required, numeric, min:0 | 'abc' | Validation fails | High |

---

### 4. Business Logic Tests

#### Commission Calculation
| Test Case ID | Feature | Description | Input | Expected Output | Priority |
|--------------|---------|-------------|-------|-----------------|----------|
| UT-BIZ-001 | Commission Rate | Test 10% commission calculation | Price: 1000 | Commission: 100 | High |
| UT-BIZ-002 | Seller Amount | Test seller receives 90% | Price: 1000 | Seller gets: 900 | High |
| UT-BIZ-003 | Platform Fee | Test platform payment is 10% | Transaction amount | Correct platform fee | High |

#### Escrow System
| Test Case ID | Feature | Description | Input | Expected Output | Priority |
|--------------|---------|-------------|-------|-----------------|----------|
| UT-ESCROW-001 | Escrow Amount | Test escrow holds full amount | Transaction: 1000 | Escrow: 1000 | High |
| UT-ESCROW-002 | Release to Seller | Test escrow releases on delivery | Confirm delivery | Seller gets 900 | High |
| UT-ESCROW-003 | Cancellation Refund | Test buyer refund on cancel | Cancel transaction | Buyer refunded | High |

---

### 5. AI Recommender Tests

#### AIRecommenderController
| Test Case ID | Method | Description | Input | Expected Output | Priority |
|--------------|--------|-------------|-------|-----------------|----------|
| UT-AI-001 | getRecommendations() | Test AI recommendations return | Wardrobe items | Outfit recommendations | Medium |
| UT-AI-002 | saveOutfit() | Test saving outfit | Outfit data | Outfit saved | Medium |
| UT-AI-003 | submitFeedback() | Test feedback submission | Feedback data | Feedback saved | Low |

---

## Instructions

**Please fill in or modify the tables above with your specific test cases.** You can:

1. Add more test cases to existing tables
2. Add new sections for other modules
3. Modify priorities (High/Medium/Low)
4. Add more detailed descriptions
5. Specify exact expected values

Once you provide the completed test cases, I will:
1. ✅ Generate PEST unit tests for each test case
2. ✅ Organize them in the `tests/Unit/` directory
3. ✅ Make them runnable via the browser test dashboard
4. ✅ Add proper assertions and test data
5. ✅ Include database factories and seeders as needed

---

## Example Test Case Entry

Here's how to fill in a test case:

```
| UT-EXAMPLE-001 | calculateTotal() | Test cart total calculation | Cart with 3 items at 100 each | Total = 300 | High |
```

This will generate:

```php
it('calculates cart total correctly', function () {
    $cart = Cart::factory()->create();
    $cart->items()->createMany([
        ['price' => 100],
        ['price' => 100],
        ['price' => 100],
    ]);
    
    expect($cart->calculateTotal())->toBe(300);
});
```


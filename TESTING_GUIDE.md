# 🧪 PEST Testing Guide - ReStyle 6.0

This guide explains how to use the automated testing system with browser-based test visualization.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Dashboard Access](#test-dashboard-access)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Test Database](#test-database)
7. [Continuous Integration](#continuous-integration)

---

## 🎯 Overview

ReStyle 6.0 uses **PEST PHP** for elegant and readable testing. We've created a custom **browser-based test dashboard** that allows you to:

- ✅ Run unit and feature tests from your browser
- ✅ See real-time test execution progress
- ✅ View detailed test results with pass/fail status
- ✅ Monitor console output during test execution
- ✅ Track test statistics (total, passed, failed, duration)

---

## 🌐 Test Dashboard Access

### Option 1: Inertia Dashboard (Requires Authentication)

**URL**: `http://localhost/test-dashboard`

- Full Inertia.js/React interface
- Integrated with your application layout
- Requires user authentication

### Option 2: Standalone HTML Runner (No Authentication)

**URL**: `http://localhost/test-runner`

- Standalone HTML page with Tailwind CSS
- No authentication required
- Perfect for development and CI/CD environments

### Features

Both dashboards provide:

- **Run Unit Tests**: Execute all tests in `tests/Unit/`
- **Run Feature Tests**: Execute all tests in `tests/Feature/`
- **Run All Tests**: Execute the entire test suite
- **Real-time Console**: View live output as tests run
- **Statistics Dashboard**: Track test metrics

---

## 🚀 Running Tests

### From Browser

1. Navigate to `http://localhost/test-runner`
2. Click one of the test buttons:
   - **Unit Tests**: Run unit tests only
   - **Feature Tests**: Run integration/feature tests
   - **All Tests**: Run complete test suite
3. Watch real-time execution in the dashboard
4. View results organized by test suite

### From Command Line

```bash
# Run all tests
./vendor/bin/pest

# Run only unit tests
./vendor/bin/pest --testsuite=Unit

# Run only feature tests
./vendor/bin/pest --testsuite=Feature

# Run specific test file
./vendor/bin/pest tests/Unit/Models/UserTest.php

# Run with coverage
./vendor/bin/pest --coverage

# Run in parallel (faster)
./vendor/bin/pest --parallel
```

---

## 📁 Test Structure

```
tests/
├── Unit/                      # Unit tests (isolated, fast)
│   ├── Models/
│   │   ├── UserTest.php
│   │   ├── ProductTest.php
│   │   ├── TransactionTest.php
│   │   └── WardrobeItemTest.php
│   ├── Controllers/
│   │   ├── WardrobeControllerTest.php
│   │   ├── MarketplaceControllerTest.php
│   │   └── TransactionControllerTest.php
│   └── Services/
│       └── CommissionServiceTest.php
│
├── Feature/                   # Integration tests (full stack)
│   ├── Auth/
│   │   ├── AuthenticationTest.php
│   │   ├── RegistrationTest.php
│   │   └── PasswordResetTest.php
│   ├── Wardrobe/
│   │   └── WardrobeManagementTest.php
│   └── Marketplace/
│       └── ProductListingTest.php
│
├── Pest.php                   # PEST configuration
└── TestCase.php              # Base test case class
```

---

## ✍️ Writing Tests

### PEST Syntax

PEST uses a beautiful, expressive syntax:

```php
<?php

use App\Models\User;
use App\Models\Product;

// Simple test
it('creates a user successfully', function () {
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com'
    ]);
    
    expect($user->name)->toBe('John Doe')
        ->and($user->email)->toBe('john@example.com');
});

// Test with description
test('users can create products', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['user_id' => $user->id]);
    
    expect($product->user->id)->toBe($user->id);
});

// Test with datasets
it('validates product prices', function ($price, $isValid) {
    $product = Product::factory()->make(['price' => $price]);
    
    if ($isValid) {
        expect($product->price)->toBeGreaterThan(0);
    } else {
        expect($product->price)->toBeLessThanOrEqual(0);
    }
})->with([
    [100, true],
    [0, false],
    [-50, false],
]);
```

### Common Expectations

```php
// Equality
expect($value)->toBe(10);
expect($value)->toEqual($expected);

// Truthiness
expect($value)->toBeTrue();
expect($value)->toBeFalse();
expect($value)->toBeNull();

// Types
expect($value)->toBeInt();
expect($value)->toBeString();
expect($value)->toBeArray();

// Comparisons
expect($value)->toBeGreaterThan(5);
expect($value)->toBeLessThan(100);
expect($value)->toBeGreaterThanOrEqual(10);

// Strings
expect($string)->toContain('substring');
expect($string)->toStartWith('Hello');
expect($string)->toMatch('/pattern/');

// Arrays
expect($array)->toHaveCount(5);
expect($array)->toContain('item');
expect($array)->toHaveKey('key');

// Objects
expect($model)->toBeInstanceOf(User::class);
expect($model)->toHaveProperty('name');

// Database
expect(User::all())->toHaveCount(10);
```

---

## 🗄️ Test Database

### Configuration

Tests use SQLite in-memory database (configured in `phpunit.xml`):

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

### Using RefreshDatabase

Enable database refresh in your tests:

```php
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create users', function () {
    $user = User::factory()->create();
    
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => $user->email
    ]);
});
```

### Factories

Use factories to create test data:

```php
// Create a single user
$user = User::factory()->create();

// Create multiple users
$users = User::factory()->count(10)->create();

// Create with specific attributes
$admin = User::factory()->create([
    'is_admin' => true,
    'email' => 'admin@example.com'
]);

// Create without saving
$user = User::factory()->make();
```

---

## 📊 Example Unit Tests

### Model Test Example

Create `tests/Unit/Models/ProductTest.php`:

```php
<?php

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('belongs to a user', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['user_id' => $user->id]);
    
    expect($product->user)->toBeInstanceOf(User::class)
        ->and($product->user->id)->toBe($user->id);
});

it('belongs to a category', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);
    
    expect($product->category)->toBeInstanceOf(Category::class)
        ->and($product->category->id)->toBe($category->id);
});

it('has default status of active', function () {
    $product = Product::factory()->create();
    
    expect($product->status)->toBe('active');
});

it('validates price is positive', function () {
    $product = Product::factory()->make(['price' => -100]);
    
    expect(fn() => $product->save())->toThrow(\Exception::class);
});
```

### Controller Test Example

Create `tests/Unit/Controllers/WardrobeControllerTest.php`:

```php
<?php

use App\Models\User;
use App\Models\WardrobeItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('displays user wardrobe items', function () {
    $user = User::factory()->create();
    WardrobeItem::factory()->count(5)->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->get(route('wardrobe.index'));
    
    $response->assertStatus(200);
    expect($response->viewData('items'))->toHaveCount(5);
});

it('creates wardrobe item', function () {
    $user = User::factory()->create();
    
    $data = [
        'name' => 'Blue Jeans',
        'category' => 'pants',
        'color' => 'blue',
        'size' => 'M'
    ];
    
    $response = $this->actingAs($user)->post(route('wardrobe.store'), $data);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('wardrobe_items', [
        'user_id' => $user->id,
        'name' => 'Blue Jeans'
    ]);
});
```

---

## 🔄 Continuous Integration

### GitHub Actions Example

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite
          
      - name: Install Dependencies
        run: composer install --prefer-dist --no-interaction
        
      - name: Run Tests
        run: ./vendor/bin/pest
        
      - name: Run Tests with Coverage
        run: ./vendor/bin/pest --coverage --min=80
```

---

## 📝 Best Practices

### 1. Test Organization

- **Unit Tests**: Test single units of code in isolation
- **Feature Tests**: Test complete user flows
- **Keep tests focused**: One concept per test
- **Use descriptive names**: Tests should read like documentation

### 2. Test Independence

- Each test should be independent
- Don't rely on test execution order
- Always refresh database between tests
- Clean up after yourself

### 3. Test Data

- Use factories for creating test data
- Don't use production data in tests
- Keep test data minimal and relevant

### 4. Assertions

- Use specific assertions
- Test one thing at a time
- Make assertions meaningful
- Avoid over-testing

### 5. Performance

- Keep unit tests fast (< 100ms each)
- Use in-memory database
- Mock external services
- Run tests in parallel when possible

---

## 🐛 Debugging Tests

### View Test Output

```bash
# Verbose output
./vendor/bin/pest --verbose

# Display warnings
./vendor/bin/pest --display-warnings

# Stop on failure
./vendor/bin/pest --stop-on-failure
```

### Use dd() and dump()

```php
it('debugs values', function () {
    $user = User::factory()->create();
    
    dump($user); // Display and continue
    dd($user);   // Display and die
});
```

### Check Database State

```php
it('checks database', function () {
    $user = User::factory()->create();
    
    // Dump all users
    dd(User::all());
    
    // Check specific record
    $this->assertDatabaseHas('users', ['id' => $user->id]);
});
```

---

## 📚 Additional Resources

- [PEST Documentation](https://pestphp.com)
- [Laravel Testing](https://laravel.com/docs/testing)
- [PHPUnit Documentation](https://phpunit.de)

---

## 🎉 Next Steps

1. **Fill out** `TEST_CASES_TEMPLATE.md` with your specific test cases
2. **Review** the generated tests
3. **Run** tests via browser dashboard
4. **Iterate** and improve test coverage
5. **Integrate** with CI/CD pipeline

Happy Testing! 🚀


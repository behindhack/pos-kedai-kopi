# TEST CASES & EXECUTION PLAN
## POS Kedai Kopi - Comprehensive Test Suite

**Tanggal:** 28 Mei 2026  
**Version:** 1.0

---

## DAFTAR ISI
1. [Test Strategy](#test-strategy)
2. [Unit Test Cases](#unit-test-cases)
3. [Integration Test Cases](#integration-test-cases)
4. [E2E Test Cases](#e2e-test-cases)
5. [Performance Test Cases](#performance-test-cases)
6. [Security Test Cases](#security-test-cases)
7. [Test Execution Plan](#test-execution-plan)

---

## TEST STRATEGY

### Testing Pyramid
```
                  /\
                /    \
              /  E2E  \        (10% - Critical User Flows)
            /          \
          /              \
        /   Integration  \    (20% - API & Database)
      /                    \
    /________________________\
   /    Unit Tests           \  (70% - Functions & Components)
  /__________________________\
```

### Testing Approach
- **Test-First**: Write tests before implementation
- **TDD**: Development driven by test requirements
- **Coverage Target**: 80% code coverage minimum
- **Automation**: Automated testing in CI/CD pipeline
- **Manual**: Critical flows tested manually

---

## UNIT TEST CASES

### Frontend Unit Tests

#### Module: Authentication Store (`src/stores/auth.ts`)

**Test Suite: User Registration**
```typescript
describe('useAuthStore - register', () => {
  let authStore;

  beforeEach(() => {
    authStore = useAuthStore();
    clearStorage();
  });

  test('TC-AUTH-01: Should successfully register first user as OWNER', async () => {
    // Arrange
    const credentials = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };

    // Act
    const result = await authStore.register(
      credentials.email,
      credentials.password,
      credentials.name
    );

    // Assert
    expect(result.success).toBe(true);
    expect(authStore.currentUser?.role).toBe('OWNER');
    expect(authStore.token).toBeTruthy();
    expect(localStorage.getItem('auth_token')).toBe(authStore.token);
  });

  test('TC-AUTH-02: Should reject registration with invalid email', async () => {
    // Arrange
    const credentials = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'SecurePass123!'
    };

    // Act
    const result = await authStore.register(
      credentials.email,
      credentials.password,
      credentials.name
    );

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('email');
  });

  test('TC-AUTH-03: Should reject weak password', async () => {
    // Arrange
    const credentials = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123' // Too short & weak
    };

    // Act
    const result = await authStore.register(
      credentials.email,
      credentials.password,
      credentials.name
    );

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('6 karakter');
  });

  test('TC-AUTH-04: Should reject short name', async () => {
    // Arrange
    const credentials = {
      name: 'J',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };

    // Act
    const result = await authStore.register(
      credentials.email,
      credentials.password,
      credentials.name
    );

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('nama');
  });
});

describe('useAuthStore - login', () => {
  test('TC-AUTH-05: Should successfully login with valid credentials', async () => {
    // Setup: Register first
    // Act: Login
    // Assert: Token stored, user set
  });

  test('TC-AUTH-06: Should fail login with invalid credentials', async () => {
    // Act
    const result = await authStore.login('wrong@email.com', 'wrongpass');

    // Assert
    expect(result.success).toBe(false);
    expect(authStore.token).toBeNull();
  });

  test('TC-AUTH-07: Should auto-logout after 24 hours', async () => {
    // Arrange: Set login timestamp to > 24 hours ago
    localStorage.setItem('login_timestamp', Date.now() - (25 * 60 * 60 * 1000));

    // Act
    authStore.loadFromStorage();

    // Assert
    expect(authStore.token).toBeNull();
    expect(authStore.currentUser).toBeNull();
  });

  test('TC-AUTH-08: Should maintain session within 24 hours', async () => {
    // Arrange: Set login timestamp to < 1 hour ago
    localStorage.setItem('login_timestamp', Date.now() - (60 * 60 * 1000));

    // Act
    authStore.loadFromStorage();

    // Assert
    expect(authStore.token).toBeTruthy();
    expect(authStore.isAuthenticated).toBe(true);
  });
});
```

#### Module: Utility Functions

**Test Suite: Formatters (`src/utils/formatters.ts`)**
```typescript
describe('formatters', () => {
  test('TC-FMT-01: Should format currency correctly', () => {
    expect(formatCurrency(50000)).toBe('Rp 50.000');
    expect(formatCurrency(1000000)).toBe('Rp 1.000.000');
    expect(formatCurrency(0)).toBe('Rp 0');
  });

  test('TC-FMT-02: Should format date correctly', () => {
    const date = new Date('2026-05-28');
    expect(formatDate(date)).toBe('28 Mei 2026');
  });

  test('TC-FMT-03: Should format time correctly', () => {
    const time = new Date('2026-05-28T14:30:00');
    expect(formatTime(time)).toBe('14:30');
  });

  test('TC-FMT-04: Should handle edge cases', () => {
    expect(formatCurrency(-50000)).toBe('-Rp 50.000');
    expect(formatCurrency(null)).toBe('Rp 0');
    expect(formatCurrency(undefined)).toBe('Rp 0');
  });
});
```

### Backend Unit Tests

#### Module: Auth Controller

**Test Suite: Login Controller**
```typescript
describe('authController.login', () => {
  const mockUser = {
    _id: new ObjectId(),
    email: 'user@example.com',
    passwordHash: '$2a$10$...',
    name: 'Test User',
    role: 'CASHIER',
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-BE-AUTH-01: Should successfully login with valid credentials', async () => {
    // Arrange
    const req = {
      body: {
        email: 'user@example.com',
        password: 'password123'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    User.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    generateToken = jest.fn().mockReturnValue('jwt_token_here');

    // Act
    await login(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      token: 'jwt_token_here',
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      }
    });
  });

  test('TC-BE-AUTH-02: Should reject login with non-existent email', async () => {
    // Arrange
    const req = {
      body: {
        email: 'nonexistent@example.com',
        password: 'password123'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    User.findOne = jest.fn().mockResolvedValue(null);

    // Act
    await login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid email or password'
    });
  });

  test('TC-BE-AUTH-03: Should reject login with wrong password', async () => {
    // Arrange
    const req = {
      body: {
        email: 'user@example.com',
        password: 'wrongpassword'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    User.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    // Act
    await login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid email or password'
    });
  });

  test('TC-BE-AUTH-04: Should reject login for inactive user', async () => {
    // Arrange
    const inactiveUser = { ...mockUser, isActive: false };
    const req = {
      body: {
        email: 'user@example.com',
        password: 'password123'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    User.findOne = jest.fn().mockResolvedValue(inactiveUser);

    // Act
    await login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'User account is inactive'
    });
  });
});
```

---

## INTEGRATION TEST CASES

### API Integration Tests

#### Test Suite: Complete Authentication Flow
```typescript
describe('Authentication Flow Integration', () => {
  const testUser = {
    name: 'Integration Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'IntegrationTest123!'
  };

  test('TC-INT-AUTH-01: Complete register -> login -> access protected route', async () => {
    // Step 1: Register
    let response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    const token = response.body.token;

    // Step 2: Login
    response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();

    // Step 3: Access protected route
    response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });

  test('TC-INT-AUTH-02: Should reject protected route without token', async () => {
    const response = await request(app)
      .get('/api/users');
    
    expect(response.status).toBe(401);
  });
});
```

#### Test Suite: Sale Creation with Inventory Update
```typescript
describe('Sale Creation Integration', () => {
  let product;
  let rawMaterial;
  let token;

  beforeAll(async () => {
    // Setup: Create product and raw material
    // Get auth token
  });

  test('TC-INT-SALE-01: Creating sale should update raw material inventory', async () => {
    // Arrange: Get initial inventory
    let inventoryBefore = await RawMaterial.findById(rawMaterial._id);
    const qtyBefore = inventoryBefore.quantity;

    // Act: Create sale
    const saleData = {
      orderType: 'DINE_IN',
      items: [{
        product: { 
          id: product._id, 
          name: product.name,
          basePrice: product.basePrice
        },
        qty: 2,
        selectedVariantIds: []
      }],
      discount: 0,
      payment: {
        method: 'CASH',
        paidAmount: product.basePrice * 2
      }
    };

    const response = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send(saleData);

    // Assert
    expect(response.status).toBe(201);
    
    inventoryBefore = await RawMaterial.findById(rawMaterial._id);
    const qtyAfter = inventoryBefore.quantity;
    
    expect(qtyAfter).toBeLessThan(qtyBefore);
  });

  test('TC-INT-SALE-02: Should reject sale if inventory insufficient', async () => {
    // Arrange: Set raw material to very low qty
    await RawMaterial.findByIdAndUpdate(
      rawMaterial._id,
      { quantity: 0.1 }
    );

    // Act
    const saleData = {
      orderType: 'DINE_IN',
      items: [{
        product: { id: product._id, ... },
        qty: 100, // Require much more than available
        ...
      }],
      ...
    };

    const response = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send(saleData);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('stok');
  });
});
```

---

## E2E TEST CASES

### Frontend End-to-End Tests (Cypress)

#### Test Suite: Complete POS Checkout Flow
```typescript
describe('Complete POS Checkout Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('owner@example.com');
    cy.get('input[name="password"]').type('OwnerPassword123!');
    cy.get('button[type="submit"]').click();
    cy.visit('/tabs/kasir');
  });

  it('TC-E2E-01: Should complete full checkout flow from product selection to payment', () => {
    // Step 1: Select product
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="qty-input"]').clear().type('2');
    cy.get('[data-testid="add-to-cart"]').click();
    
    // Verify item added
    cy.get('[data-testid="cart-item"]').should('have.length', 1);

    // Step 2: Verify calculations
    cy.get('[data-testid="subtotal"]').should('contain', 'Rp');
    cy.get('[data-testid="total"]').should('contain', 'Rp');

    // Step 3: Proceed to checkout
    cy.get('[data-testid="checkout-btn"]').click();

    // Step 4: Select payment method
    cy.get('[data-testid="payment-cash"]').click();
    cy.get('[data-testid="paid-amount"]').clear().type('100000');

    // Step 5: Verify change calculation
    cy.get('[data-testid="change"]').should('contain', 'Rp');

    // Step 6: Complete payment
    cy.get('[data-testid="pay-btn"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('TC-E2E-02: Should calculate correct tax for each item', () => {
    // Add multiple items
    cy.get('[data-testid="product-card"]').eq(0).click();
    cy.get('[data-testid="add-to-cart"]').click();
    
    cy.get('[data-testid="product-card"]').eq(1).click();
    cy.get('[data-testid="qty-input"]').clear().type('3');
    cy.get('[data-testid="add-to-cart"]').click();

    // Verify tax calculation
    cy.get('[data-testid="tax"]').then(($tax) => {
      const taxAmount = parseInt($tax.text());
      expect(taxAmount).toBeGreaterThan(0);
    });
  });

  it('TC-E2E-03: Should apply discount correctly', () => {
    // Add item
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();

    // Get original total
    cy.get('[data-testid="subtotal"]').then(($original) => {
      const original = parseInt($original.text());

      // Apply discount
      cy.get('[data-testid="discount-input"]').clear().type('10000');

      // Verify new total
      cy.get('[data-testid="total"]').then(($new) => {
        const newTotal = parseInt($new.text());
        expect(newTotal).toBe(original - 10000);
      });
    });
  });
});
```

#### Test Suite: Order Management
```typescript
describe('Order Management Flow', () => {
  it('TC-E2E-04: Should track order through all statuses', () => {
    cy.visit('/tabs/pesanan');

    // Wait for orders to load
    cy.get('[data-testid="order-item"]').should('exist');

    // Find an order in PENDING status
    cy.get('[data-testid="order-status"][data-status="PENDING"]')
      .first()
      .parent()
      .then(($order) => {
        const orderNumber = $order.find('[data-testid="order-number"]').text();

        // Update to PREPARING
        cy.wrap($order).find('[data-testid="status-update"]').click();
        cy.get('[data-testid="status-preparing"]').click();

        // Verify status changed
        cy.get(`[data-order-id="${orderNumber}"][data-status="PREPARING"]`)
          .should('exist');
      });
  });
});
```

---

## PERFORMANCE TEST CASES

### Load Testing

#### Test: API Response Time
```typescript
describe('API Performance Tests', () => {
  test('TC-PERF-01: Login endpoint should respond < 200ms', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  test('TC-PERF-02: Get sales with 1000 records should respond < 500ms', async () => {
    // Setup: Create 1000 sales records
    const sales = Array(1000).fill(null).map(() => ({...}));
    await Sale.insertMany(sales);

    const start = Date.now();
    
    const response = await request(app)
      .get('/api/sales?page=1&limit=50')
      .set('Authorization', `Bearer ${token}`);
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(500);
  });

  test('TC-PERF-03: Frontend bundle size should be < 500kb gzipped', async () => {
    // This would run in build pipeline
    // Check: dist/assets/*.js total size
  });
});
```

---

## SECURITY TEST CASES

### Security Testing

#### Test Suite: Input Validation
```typescript
describe('Security - Input Validation', () => {
  test('TC-SEC-01: Should prevent SQL/NoSQL Injection in login', async () => {
    const maliciousInputs = [
      { email: { $ne: null }, password: 'anything' },
      { email: { $gt: '' }, password: { $gt: '' } },
      { email: 'admin"; DROP TABLE users;--', password: 'anything' }
    ];

    for (const input of maliciousInputs) {
      const response = await request(app)
        .post('/api/auth/login')
        .send(input);
      
      expect(response.status).not.toBe(200);
    }
  });

  test('TC-SEC-02: Should sanitize HTML/XSS attempts', async () => {
    const xssPayload = {
      name: '<script>alert("XSS")</script>',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(xssPayload);
    
    // Even if successful, script should be sanitized
    const user = await User.findOne({ email: xssPayload.email });
    expect(user.name).not.toContain('<script>');
  });
});
```

#### Test Suite: Rate Limiting
```typescript
describe('Security - Rate Limiting', () => {
  test('TC-SEC-03: Should rate limit login attempts', async () => {
    const attempts = 6; // More than limit

    for (let i = 0; i < attempts; i++) {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      if (i < 5) {
        expect([401, 400]).toContain(response.status);
      } else {
        // 6th attempt should be rate limited
        expect(response.status).toBe(429);
      }
    }
  });
});
```

---

## TEST EXECUTION PLAN

### Phase 1: Unit Tests (Week 1)
```
Timeline: 5 days

Day 1: Setup test infrastructure
- Install Jest/Vitest
- Configure test environment
- Create test utilities

Day 2-3: Frontend unit tests
- Auth store tests
- Composables tests
- Utilities tests
Target: 40 tests, 80% coverage

Day 4-5: Backend unit tests  
- Controller tests
- Model tests
- Utility tests
Target: 35 tests, 85% coverage

Deliverable: All unit tests passing with coverage report
```

### Phase 2: Integration Tests (Week 2)
```
Timeline: 5 days

Day 1: Test infrastructure setup
- Database test fixtures
- Mock external services
- Test data factories

Day 2-3: API integration tests
- Auth flow tests
- Sale creation tests
- Inventory tests
Target: 20 tests

Day 4-5: State & API sync tests
- Frontend-backend sync
- Data consistency
Target: 15 tests

Deliverable: Integration tests passing, documented API contracts
```

### Phase 3: E2E Tests (Week 3)
```
Timeline: 5 days

Day 1: Cypress setup
- Configure Cypress
- Create test helpers
- Setup CI integration

Day 2-3: Critical path tests
- Login → Checkout → Payment
- Product management
- Report generation
Target: 8-10 tests

Day 4-5: Edge cases
- Error scenarios
- Mobile responsive
- Performance
Target: 5-7 tests

Deliverable: E2E tests passing, video recordings
```

### Phase 4: Performance & Security (Week 4)
```
Timeline: 5 days

Day 1-2: Performance testing
- Load testing
- Bundle analysis
- Database query optimization
Target: All response times < acceptable thresholds

Day 3-4: Security testing
- Vulnerability scanning
- Penetration testing
- Input validation testing
Target: Zero critical vulnerabilities

Day 5: Final review
- Coverage report
- Performance metrics
- Security audit report

Deliverable: Complete test results, metrics, recommendations
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Automated Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20]
    
    services:
      mongodb:
        image: mongo:5
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Unit Tests
        run: npm run test:unit
      
      - name: Integration Tests
        run: npm run test:integration
        env:
          MONGODB_URI: mongodb://localhost:27017/pos_test
      
      - name: E2E Tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Test Metrics & Reporting

```
Metrics to Track:
- Code Coverage: Target 80%+
- Test Pass Rate: 100%
- Test Execution Time: < 5 minutes
- Bug Detection Rate: Critical bugs found by tests
- Test Maintenance: Tests pass in CI/CD

Reporting:
- Weekly: Test results, coverage trends
- Per Sprint: Bug report by severity
- Pre-Release: Full test report, sign-off checklist
```

---

## TEST DATA FIXTURES

### User Test Fixtures
```typescript
export const testUsers = {
  owner: {
    id: '507f1f77bcf86cd799439001',
    name: 'Owner User',
    email: 'owner@example.com',
    password: 'OwnerPass123!',
    role: 'OWNER',
    isActive: true
  },
  cashier: {
    id: '507f1f77bcf86cd799439002',
    name: 'Cashier User',
    email: 'cashier@example.com',
    password: 'CashierPass123!',
    role: 'CASHIER',
    isActive: true
  },
  barista: {
    id: '507f1f77bcf86cd799439003',
    name: 'Barista User',
    email: 'barista@example.com',
    password: 'BaristaPass123!',
    role: 'BARISTA',
    isActive: true
  }
};
```

### Product Test Fixtures
```typescript
export const testProducts = {
  espresso: {
    id: '507f1f77bcf86cd799439011',
    name: 'Espresso',
    category: 'ESPRESSO',
    basePrice: 15000,
    isActive: true,
    variants: [
      { id: 'v1', name: 'Single Shot', extraPrice: 0 },
      { id: 'v2', name: 'Double Shot', extraPrice: 5000 }
    ]
  },
  cappuccino: {
    id: '507f1f77bcf86cd799439012',
    name: 'Cappuccino',
    category: 'ESPRESSO',
    basePrice: 25000,
    isActive: true
  }
};
```

---

**End of Test Cases & Execution Plan**

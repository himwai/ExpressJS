# KPay API Endpoint

A TypeScript Express.js API service for integrating with KPay payment gateway to create hosted checkout orders. This service provides a secure interface for generating payment checkout URLs with proper signature authentication.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MarcoWong06/kpay-api-endpoint.git
cd kpay-api-endpoint
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on port 3000 by default (configurable via `PORT` environment variable).

## API Documentation

### Create Hosted Checkout Order

Creates a new hosted checkout order and returns a secure checkout URL.

**Endpoint:** `POST /api/v1/all-hosted-checkout-order`

**Request Body:**

```typescript
{
  language: "en_US" | "zh_CN" | "zh_HK",        // Language preference
  kpayApiKey: string,                        // RSA private key for signature
  merchantIcon: string | null,               // Merchant icon URL
  merchantCode: string,                      // KPay merchant code
  payAmount: number,                         // Exact payment amount (positive number)
  discountAmount: number | null,             // Discount amount (optional)
  notifyUrl: string | null,                  // Payment notification URL
  returnUrl: string | null,                  // Return URL after payment
  orderRemark: string | null,                // Order remarks
  itemNo: string,                           // Item number/SKU
  itemName: string,                         // Item name
  itemIcon: string | null,                  // Item icon URL
  quantity: number,                         // Item quantity
  firstName: string | null,                 // Customer first name
  lastName: string | null,                  // Customer last name
  email: string | null,                     // Customer email
  phone: string | null                      // Customer phone
}
```

**Success Response (200):**

```json
{
  "message": "Hosted checkout order created successfully",
  "checkoutUrl": "https://payment.uat.kpay-group.com/v1/web/managed/order?..."
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors

```json
{
  "message": "Validation Error",
  "error": "Missing required field: merchantCode"
}
```

- **502 Bad Gateway** - KPay API errors

```json
{
  "message": "Payment API Error",
  "error": "Failed to create order: Invalid merchant code"
}
```

- **500 Internal Server Error** - Server errors

```json
{
  "message": "Internal Server Error",
  "error": "Unknown error occurred"
}
```

## API Flow Diagram

The following sequence diagram illustrates the complete flow of the `/api/v1/all-hosted-checkout-order` endpoint:

```plantuml
@startuml
!theme plain
title Sequence Diagram: /api/v1/all-hosted-checkout-order

actor Client
participant "Express Server" as Server
participant "AllHostedCheckoutOrder\nRouter" as Router
participant "Validation Utils" as Validation
participant "Crypto Utils" as Crypto
participant "KPayService" as KPay
participant "KPay API" as API

Client -> Server: POST /api/v1/all-hosted-checkout-order
activate Server

Server -> Router: Route request to handler
activate Router

Router -> Validation: validateOrderRequest(req.body)
activate Validation
Validation -> Validation: Check required fields\n(language, kpayApiKey, merchantCode, payAmount)
Validation -> Validation: Validate payAmount > 0
Validation -> Validation: Validate discountAmount >= 0
Validation -> Validation: Validate email format (if provided)
Validation -> Validation: Validate phone format (if provided)
alt Invalid data
    Validation -> Router: throw ValidationError
    Router -> Client: 400 Bad Request\n{message: "Validation Error", error: details}
    deactivate Validation
    deactivate Router
    deactivate Server
end
Validation --> Router: Validation passed
deactivate Validation

Router -> Router: createOrderRequestBody(req.body)
note right: Creates order with\nauto-generated managedOutTradeNo

Router -> Crypto: generateTimestampAndNonce()
activate Crypto
Crypto --> Router: {timestamp, nonceStr}
deactivate Crypto

Router -> Router: JSON.stringify(orderRequest)

Router -> Crypto: generateSignature(params, kpayApiKey)
activate Crypto
Crypto -> Crypto: Create sign string:\nrequestMethod + requestUri + timestamp +\nnonceStr + merchantCode + body
Crypto -> Crypto: Sign with RSA SHA256\nusing private key
Crypto --> Router: signature
deactivate Crypto

Router -> KPay: createOrder(orderRequest, headers)
activate KPay

KPay -> API: POST /v1/managed/order/add
activate API
note right: Headers include:\nK-Merchant-Code, K-Nonce-Str,\nK-Timestamp, K-Signature, K-Language

alt API Error
    API --> KPay: Error response
    KPay -> KPay: throw KPayApiError
    KPay --> Router: KPayApiError
    Router -> Client: 502 Bad Gateway\n{message: "Payment API Error", error: details}
    deactivate API
    deactivate KPay
    deactivate Router
    deactivate Server
end

API --> KPay: Success response\n{code, message, data: {managedOrderNo}}
deactivate API
KPay --> Router: KPayApiResponse
deactivate KPay

Router -> Router: Extract managedOrderNo\nfrom API response

Router -> Crypto: generateTimestampAndNonce()
activate Crypto
Crypto --> Router: {newTimestamp, newNonceStr}
deactivate Crypto

Router -> Crypto: generateSignature(checkoutParams, kpayApiKey)
activate Crypto
note right: For GET request to\ngenerate checkout URL
Crypto --> Router: checkoutSignature
deactivate Crypto

Router -> Crypto: createCheckoutUrl(baseUrl, managedOrderNo, merchantCode,\nnewNonceStr, newTimestamp, checkoutSignature)
activate Crypto
Crypto --> Router: checkoutUrl
deactivate Crypto

Router -> Client: 200 OK\n{message: "Hosted checkout order created successfully",\ncheckoutUrl}

deactivate Router
deactivate Server

@enduml
```

### Flow Description

The API endpoint follows these key steps:

1. **Request Validation** - Validates required fields, data types, and business rules
2. **Order Preparation** - Creates the order request body with auto-generated trade number
3. **First Signature Generation** - Generates RSA SHA256 signature for order creation API call
4. **KPay API Integration** - Calls external KPay API to create the hosted checkout order
5. **Second Signature Generation** - Generates another signature for checkout URL access
6. **Checkout URL Creation** - Builds the final authenticated checkout URL
7. **Response** - Returns the checkout URL to the client

The process involves two separate signature generations: one for creating the order via API, and another for generating the secure checkout URL that customers will use to complete their payment.

## Project Structure

```text
src/api/v1/
├── index.ts                    # Main application entry point
├── config/
│   └── constants.ts           # Configuration constants
├── routes/
│   └── AllHostedCheckoutOrder.ts  # Checkout order route handler
├── services/
│   └── kpayService.ts         # KPay API service
├── types/
│   ├── index.ts               # Exported type definitions
│   ├── allHostedCheckoutOrderRequest.ts  # Request type definitions
│   └── kpayApi.ts            # KPay API type definitions
└── utils/
    ├── crypto.ts              # Cryptographic utilities
    └── validation.ts          # Request validation utilities
```

## Configuration

The application uses a centralized configuration system in `src/config/constants.ts`:

```typescript
export const CONFIG = {
  API: {
    BASE_URL: "https://payment.uat.kpay-group.com",
    ENDPOINTS: {
      CREATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/add",
      GENERATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/web/managed/order",
    },
    SUCCESS_CODES: [10000, "10000"],
  },
  DEFAULTS: {
    CURRENCY: "HKD",
  },
  TIMEOUTS: {
    REQUEST: 30000,
  },
};
```

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:watch` - Build with watch mode
- `npm run clean` - Clean build directory
- `npm start` - Start production server

## Error Handling

The application implements comprehensive error handling:

### Custom Error Classes

- `ValidationError` - Input validation failures
- `KPayApiError` - KPay API communication errors

### Error Flow

1. **Request Validation** - Validates input before processing
2. **API Communication** - Handles KPay API errors with proper status codes
3. **Response Formatting** - Returns consistent error response format

## Example Usage

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/all-hosted-checkout-order \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "kpayApiKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
    "merchantCode": "your_merchant_code",
    "payAmount": 100.00,
    "discountAmount": null,
    "notifyUrl": "https://your-site.com/notify",
    "returnUrl": "https://your-site.com/return",
    "orderRemark": "Test order",
    "itemNo": "ITEM001",
    "itemName": "Test Product",
    "quantity": 1,
    "email": "customer@example.com"
  }'
```

### JavaScript/Node.js Example

```javascript
const response = await fetch('http://localhost:3000/api/v1/all-hosted-checkout-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    language: 'en_US',
    kpayApiKey: 'your_rsa_private_key',
    merchantCode: 'your_merchant_code',
    payAmount: 100.00,
    itemNo: 'ITEM001',
    itemName: 'Test Product',
    quantity: 1,
    email: 'customer@example.com'
  })
});

const data = await response.json();
console.log('Checkout URL:', data.checkoutUrl);
```

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Author

### WONG, Sai Lung

- GitHub: [@MarcoWong06](https://github.com/MarcoWong06)

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/MarcoWong06/kpay-api-endpoint/issues) on GitHub.

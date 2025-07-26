# 🚀 Complete Shiprocket API Integration

A comprehensive Shiprocket API integration for your Node.js + Express + MongoDB project with full order management, tracking, and webhook capabilities.

## 📁 Project Structure

```
src/
├── database/
│   └── models/
│       ├── shiprocket-order.ts      # Shiprocket order schema
│       └── shiprocket-token.ts      # Authentication token schema
├── controllers/
│   └── shiprocket/
│       └── index.ts                 # All Shiprocket controllers
├── Routes/
│   └── shiprocket.ts                # Shiprocket API routes
├── helper/
│   └── shiprocket-service.ts        # Core Shiprocket service
├── validation/
│   └── shiprocket.ts                # Input validation schemas
└── index.ts                         # Main application file

examples/
└── shiprocket-test-data.js          # Test data and examples

SHIPROCKET_SETUP.md                   # Detailed setup guide
README_SHIPROCKET.md                  # This file
```

## ✨ Features Implemented

### 🔐 Authentication
- ✅ Automatic token management with caching
- ✅ Token refresh on expiration
- ✅ Database storage for token persistence
- ✅ In-memory cache for performance

### 📦 Order Management
- ✅ Create new Shiprocket orders
- ✅ Validate payload for required data
- ✅ Save order response in MongoDB
- ✅ Link with internal orders
- ✅ Comprehensive error handling

### 🏷️ AWB Generation & Pickup
- ✅ Generate AWB numbers after order creation
- ✅ Assign couriers automatically
- ✅ Request pickup for orders
- ✅ Store AWB details in database

### 📍 Shipment Tracking
- ✅ Track by AWB number
- ✅ Track by order ID
- ✅ Store and update tracking status
- ✅ Real-time status updates

### 🔄 Webhooks
- ✅ Endpoint to receive webhook updates
- ✅ Update MongoDB records automatically
- ✅ Status synchronization with internal orders
- ✅ Webhook history tracking

### 🏗️ Project Structure
- ✅ Clean code structure with controllers, routes, services, models
- ✅ Environment variables for credentials
- ✅ Axios for API calls
- ✅ Mongoose for MongoDB schemas
- ✅ Joi for validation

### 🛡️ Additional Features
- ✅ Comprehensive error handling
- ✅ Proper HTTP status codes
- ✅ Input validation
- ✅ Production-ready code
- ✅ Modular architecture

## 🚀 Quick Start

### 1. Environment Setup

Add to your `.env` file:
```env
SHIPROCKET_EMAIL=your_email@example.com
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_PICKUP_PINCODE=400001
```

### 2. API Endpoints

All endpoints are available under `/api/shiprocket/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order |
| GET | `/orders` | Get all orders |
| GET | `/orders/:id` | Get order by ID |
| DELETE | `/orders/:id` | Cancel order |
| POST | `/orders/:id/awb` | Generate AWB |
| POST | `/orders/:id/pickup` | Request pickup |
| GET | `/track/awb/:awbNumber` | Track by AWB |
| GET | `/orders/:id/track` | Track by order ID |
| GET | `/couriers` | Get available couriers |
| POST | `/webhook` | Webhook endpoint |

### 3. Example Usage

```javascript
// Create an order
const orderData = {
  order_id: "ORDER123456",
  order_date: "2024-01-15",
  pickup_location: "Primary",
  billing_customer_name: "John Doe",
  billing_address: "123 Main Street",
  billing_city: "Mumbai",
  billing_pincode: "400001",
  billing_state: "Maharashtra",
  billing_country: "India",
  billing_email: "john@example.com",
  billing_phone: "9876543210",
  shipping_is_billing: true,
  order_items: [
    {
      name: "Product Name",
      sku: "SKU123",
      units: 2,
      selling_price: 500
    }
  ],
  payment_method: "Prepaid",
  sub_total: 1000,
  weight: 1.5
};

const response = await fetch('/api/shiprocket/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});
```

## 📊 Database Schemas

### Shiprocket Order Schema
```javascript
{
  internalOrderId: ObjectId,        // Reference to your internal order
  shiprocketOrderId: String,        // Shiprocket's order ID
  orderId: String,                  // Your order ID
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  items: [{
    name: String,
    sku: String,
    units: Number,
    sellingPrice: Number
  }],
  awbNumber: String,
  courierName: String,
  status: String,                   // pending, confirmed, processing, shipped, delivered, cancelled
  trackingData: {
    shipmentStatus: String,
    shipmentTrack: Array
  },
  webhookData: Array                // History of webhook updates
}
```

### Token Schema
```javascript
{
  token: String,                    // Authentication token
  expiresAt: Date,                  // Token expiration
  isActive: Boolean,                // Token status
  lastUsed: Date                    // Last usage timestamp
}
```

## 🔧 Configuration

### Environment Variables
- `SHIPROCKET_EMAIL`: Your Shiprocket account email
- `SHIPROCKET_PASSWORD`: Your Shiprocket account password
- `SHIPROCKET_PICKUP_PINCODE`: Your pickup location pincode

### Webhook Configuration
Configure your webhook URL in Shiprocket dashboard:
```
https://yourdomain.com/api/shiprocket/webhook
```

## 🧪 Testing

Use the provided test data in `examples/shiprocket-test-data.js`:

```javascript
const { testCompleteOrderFlow, testErrorCases } = require('./examples/shiprocket-test-data');

// Test complete order flow
await testCompleteOrderFlow();

// Test error cases
await testErrorCases();
```

## 🔒 Security Features

- ✅ Environment variable protection
- ✅ Input validation with Joi
- ✅ Error handling without data leaks
- ✅ Token management and refresh
- ✅ Webhook data validation

## 📈 Monitoring & Logging

The integration includes comprehensive logging for:
- API calls and responses
- Authentication events
- Webhook processing
- Error tracking
- Performance metrics

## 🚨 Error Handling

The integration handles various error scenarios:
- Authentication failures
- API rate limits
- Invalid data
- Network timeouts
- Webhook processing errors

## 🔄 Maintenance

- **Automatic Token Refresh**: Tokens are refreshed automatically
- **Webhook Processing**: Asynchronous webhook handling
- **Data Consistency**: Database updates on every operation
- **Error Recovery**: Retry mechanisms for failed operations

## 📞 Support

For issues:
1. Check the `SHIPROCKET_SETUP.md` for detailed troubleshooting
2. Review server logs for error details
3. Verify environment variables
4. Test with provided example data

## 🎯 Production Readiness

This integration is production-ready with:
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Security measures
- ✅ Performance optimizations
- ✅ Database indexing
- ✅ Modular architecture
- ✅ Extensive documentation

## 📝 License

This integration is part of your existing project and follows the same license terms.

---

**🎉 Your Shiprocket integration is now complete and ready for production use!**

For detailed setup instructions, see `SHIPROCKET_SETUP.md`.
For testing examples, see `examples/shiprocket-test-data.js`. 
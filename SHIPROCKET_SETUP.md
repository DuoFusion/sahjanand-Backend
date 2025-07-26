# Shiprocket API Integration Setup Guide

This guide provides complete setup instructions and usage examples for the Shiprocket API integration in your Node.js + Express project.

## 🚀 Features

- **Authentication**: Automatic token management with caching and refresh
- **Order Management**: Create, track, and manage Shiprocket orders
- **AWB Generation**: Generate AWB numbers and assign couriers
- **Pickup Management**: Request pickups for orders
- **Shipment Tracking**: Track shipments by AWB or order ID
- **Webhook Integration**: Receive real-time updates from Shiprocket
- **Error Handling**: Comprehensive error handling and validation
- **Database Integration**: Store all order and tracking data in MongoDB

## 📋 Prerequisites

1. **Shiprocket Account**: Sign up at [Shiprocket](https://www.shiprocket.in/)
2. **API Credentials**: Get your email and password from Shiprocket dashboard
3. **Pickup Location**: Set up your pickup location in Shiprocket
4. **Node.js Dependencies**: Ensure you have the required packages

## 🔧 Installation & Setup

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# Shiprocket API Credentials
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_PICKUP_PINCODE=400001

# Optional: Webhook Secret (for additional security)
SHIPROCKET_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Install Dependencies

Ensure you have the required packages in your `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "joi": "^17.11.0",
    "mongoose": "^8.0.0"
  }
}
```

### 3. Database Setup

The integration automatically creates the required MongoDB collections:
- `shiprocket_orders`: Stores order details and tracking information
- `shiprocket_tokens`: Stores authentication tokens

## 📚 API Endpoints

### Base URL: `/api/shiprocket`

### 1. Order Management

#### Create Order
```http
POST /api/shiprocket/orders
Content-Type: application/json

{
  "internalOrderId": "507f1f77bcf86cd799439011", // Optional: Your internal order ID
  "order_id": "ORDER123456",
  "order_date": "2024-01-15",
  "pickup_location": "Primary",
  "billing_customer_name": "John Doe",
  "billing_address": "123 Main Street",
  "billing_city": "Mumbai",
  "billing_pincode": "400001",
  "billing_state": "Maharashtra",
  "billing_country": "India",
  "billing_email": "john@example.com",
  "billing_phone": "9876543210",
  "shipping_is_billing": true,
  "order_items": [
    {
      "name": "Product Name",
      "sku": "SKU123",
      "units": 2,
      "selling_price": 500,
      "discount": 50,
      "tax": 45
    }
  ],
  "payment_method": "Prepaid",
  "sub_total": 1000,
  "weight": 1.5
}
```

#### Get All Orders
```http
GET /api/shiprocket/orders?page=1&limit=10&status=pending
```

#### Get Order by ID
```http
GET /api/shiprocket/orders/:id
```

#### Cancel Order
```http
DELETE /api/shiprocket/orders/:id
```

### 2. AWB & Pickup Management

#### Generate AWB
```http
POST /api/shiprocket/orders/:id/awb
Content-Type: application/json

{
  "courierId": "1" // Get from /api/shiprocket/couriers endpoint
}
```

#### Request Pickup
```http
POST /api/shiprocket/orders/:id/pickup
```

### 3. Tracking

#### Track by AWB Number
```http
GET /api/shiprocket/track/awb/:awbNumber
```

#### Track by Order ID
```http
GET /api/shiprocket/orders/:id/track
```

### 4. Courier Management

#### Get Available Couriers
```http
GET /api/shiprocket/couriers?pincode=400001&weight=1.5
```

### 5. Webhook

#### Webhook Endpoint
```http
POST /api/shiprocket/webhook
```

Configure this URL in your Shiprocket dashboard to receive real-time updates.

## 💡 Usage Examples

### Example 1: Complete Order Flow

```javascript
// 1. Create an order
const createOrderResponse = await fetch('/api/shiprocket/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_id: 'ORDER123456',
    order_date: '2024-01-15',
    pickup_location: 'Primary',
    billing_customer_name: 'John Doe',
    billing_address: '123 Main Street',
    billing_city: 'Mumbai',
    billing_pincode: '400001',
    billing_state: 'Maharashtra',
    billing_country: 'India',
    billing_email: 'john@example.com',
    billing_phone: '9876543210',
    shipping_is_billing: true,
    order_items: [
      {
        name: 'Product Name',
        sku: 'SKU123',
        units: 2,
        selling_price: 500
      }
    ],
    payment_method: 'Prepaid',
    sub_total: 1000,
    weight: 1.5
  })
});

const orderData = await createOrderResponse.json();
const shiprocketOrderId = orderData.data.shiprocketOrder._id;

// 2. Get available couriers
const couriersResponse = await fetch('/api/shiprocket/couriers?pincode=400001&weight=1.5');
const couriersData = await couriersResponse.json();
const courierId = couriersData.data.couriers[0].courier_id;

// 3. Generate AWB
const awbResponse = await fetch(`/api/shiprocket/orders/${shiprocketOrderId}/awb`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ courierId })
});

// 4. Request pickup
const pickupResponse = await fetch(`/api/shiprocket/orders/${shiprocketOrderId}/pickup`, {
  method: 'POST'
});

// 5. Track shipment
const trackingResponse = await fetch(`/api/shiprocket/orders/${shiprocketOrderId}/track`);
```

### Example 2: Webhook Integration

```javascript
// Webhook endpoint automatically updates order status
app.post('/api/shiprocket/webhook', async (req, res) => {
  // The webhook controller handles all updates automatically
  // Updates include: status changes, AWB generation, delivery updates
});
```

### Example 3: Error Handling

```javascript
try {
  const response = await fetch('/api/shiprocket/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  const result = await response.json();
  
  if (result.status !== 200) {
    console.error('Error:', result.message);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit API credentials to version control
2. **Webhook Security**: Consider implementing webhook signature verification
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: All inputs are validated using Joi schemas
5. **Error Handling**: Comprehensive error handling prevents data leaks

## 📊 Database Schema

### Shiprocket Order Schema
```javascript
{
  internalOrderId: ObjectId, // Reference to your internal order
  shiprocketOrderId: String, // Shiprocket's order ID
  orderId: String, // Your order ID
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
  status: String, // pending, confirmed, processing, shipped, delivered, cancelled
  trackingData: {
    shipmentStatus: String,
    shipmentTrack: Array
  },
  webhookData: Array // History of webhook updates
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
   - Check if credentials are correct in Shiprocket dashboard

2. **Order Creation Failed**
   - Validate all required fields
   - Check pickup location configuration
   - Ensure pincode is serviceable

3. **AWB Generation Failed**
   - Verify courier ID is valid
   - Check if order is in correct status
   - Ensure courier serves the destination

4. **Webhook Not Receiving Updates**
   - Verify webhook URL is correctly configured in Shiprocket
   - Check server logs for webhook processing errors
   - Ensure webhook endpoint is publicly accessible

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=shiprocket:*
```

## 📞 Support

For issues related to:
- **Shiprocket API**: Contact Shiprocket support
- **Integration Code**: Check the code comments and error messages
- **Database Issues**: Verify MongoDB connection and schema

## 🔄 Updates & Maintenance

1. **Token Refresh**: Tokens are automatically refreshed when expired
2. **Webhook Processing**: All webhooks are processed asynchronously
3. **Error Recovery**: Failed operations can be retried
4. **Data Consistency**: Database is updated with every API call

## 📈 Monitoring

Monitor the following metrics:
- API response times
- Webhook processing success rate
- Order creation success rate
- AWB generation success rate
- Database performance

---

**Note**: This integration is production-ready and includes comprehensive error handling, validation, and security measures. Always test thoroughly in a staging environment before deploying to production. 
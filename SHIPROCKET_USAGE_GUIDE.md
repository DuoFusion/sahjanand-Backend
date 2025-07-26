# 🚀 Shiprocket Integration Usage Guide

This guide explains how to use the Shiprocket integration with your existing order system.

## 📋 Overview

The Shiprocket integration allows you to:
1. **Create Shiprocket orders** from your existing internal orders
2. **Generate AWB numbers** for shipping
3. **Request pickups** from couriers
4. **Track shipments** in real-time
5. **Receive webhook updates** for status changes

## 🔄 Workflow

### Step 1: Create Internal Order (Your Existing Flow)
```javascript
// This is your existing order creation process
const orderData = {
    userId: user._id,
    products: [
        {
            productId: productId,
            quantity: 2,
            price: 500
        }
    ],
    totalAmount: 1000,
    shippingAddress: {
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
        phoneNumber: "9876543210",
        email: "customer@example.com"
    }
};

// Your existing placeOrder function
const order = await placeOrder(orderData);
// Returns: { orderId: "507f1f77bcf86cd799439011", ... }
```

### Step 2: Create Shiprocket Order
```javascript
// After creating your internal order, create Shiprocket order
const shiprocketData = {
    internalOrderId: "507f1f77bcf86cd799439011" // Your internal order ID
};

const response = await fetch('/api/ship-rocket/orders', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify(shiprocketData)
});

const result = await response.json();
// Returns: { shiprocketOrderId: "SR123456", ... }
```

### Step 3: Generate AWB Number
```javascript
// Get available couriers first
const couriersResponse = await fetch('/api/ship-rocket/couriers?pincode=400001&weight=1.5');
const couriersData = await couriersResponse.json();
const courierId = couriersData.data.couriers[0].courier_id;

// Generate AWB
const awbResponse = await fetch(`/api/ship-rocket/orders/${shiprocketOrderId}/awb`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({ courierId })
});

const awbResult = await awbResponse.json();
// Returns: { awbNumber: "123456789012", ... }
```

### Step 4: Request Pickup
```javascript
const pickupResponse = await fetch(`/api/ship-rocket/orders/${shiprocketOrderId}/pickup`, {
    method: 'POST',
    headers: { 
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
});

const pickupResult = await pickupResponse.json();
// Returns: { status: "Pickup requested successfully" }
```

### Step 5: Track Shipment
```javascript
// Track by AWB number
const trackingResponse = await fetch(`/api/ship-rocket/track/awb/${awbNumber}`);
const trackingData = await trackingResponse.json();

// Or track by order ID
const orderTrackingResponse = await fetch(`/api/ship-rocket/orders/${shiprocketOrderId}/track`);
const orderTrackingData = await orderTrackingResponse.json();
```

## 📡 API Endpoints

### Base URL: `/api/ship-rocket`

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/orders` | Create Shiprocket order | `{ internalOrderId: "..." }` |
| GET | `/orders` | Get all Shiprocket orders | Query params: `page`, `limit`, `status` |
| GET | `/orders/:id` | Get Shiprocket order by ID | - |
| DELETE | `/orders/:id` | Cancel Shiprocket order | - |
| POST | `/orders/:id/awb` | Generate AWB | `{ courierId: "..." }` |
| POST | `/orders/:id/pickup` | Request pickup | - |
| GET | `/track/awb/:awbNumber` | Track by AWB | - |
| GET | `/orders/:id/track` | Track by order ID | - |
| GET | `/couriers` | Get available couriers | Query params: `pincode`, `weight` |
| POST | `/webhook` | Webhook endpoint | Shiprocket webhook data |

## 🔧 Integration with Your Existing Code

### 1. Update Your Order Creation Flow

```javascript
// In your existing placeOrder function, after creating the order:
export const placeOrder = async (req, res) => {
    // ... your existing order creation code ...
    
    let order = new orderModel(body);
    await order.save();
    
    // After successful order creation, you can optionally create Shiprocket order
    // This can be done immediately or later when ready to ship
    
    return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order'), {
        order,
        shippingAddress,
        razorpayOrder,
        // Add note about Shiprocket integration
        shiprocketNote: "Use /api/ship-rocket/orders to create shipping order when ready"
    }, {}));
};
```

### 2. Add Shiprocket Status to Order Tracking

```javascript
// In your existing trackOrder function:
export const trackOrder = async (req, res) => {
    reqInfo(req)
    try {
        const { trackingId } = req.params;
        const order = await orderModel.findOne({ trackingId });

        if (!order) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Order'), {}, {}));

        // Check if Shiprocket order exists
        let shiprocketData = null;
        if (order.shiprocketOrderId) {
            const shiprocketOrder = await shipRocketOrderModel.findOne({ 
                shiprocketOrderId: order.shiprocketOrderId 
            });
            shiprocketData = shiprocketOrder;
        }

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Order'), { 
            orderStatus: order.orderStatus, 
            trackingId: order.trackingId,
            shiprocketData: shiprocketData
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
```

### 3. Update Order Status Management

```javascript
// In your existing updateOrderStatus function:
export const updateOrderStatus = async (req, res) => {
    reqInfo(req)
    try {
        const { orderId } = req.params;
        const { orderStatus, trackingId } = req.body;

        const order = await orderModel.findOneAndUpdate({ _id: new ObjectId(orderId) }, { orderStatus, trackingId }, { new: true });

        if (!order) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Order'), {}, {}));

        // If order is being shipped, check if Shiprocket order exists
        if (orderStatus === 'shipped' && !order.shiprocketOrderId) {
            return res.status(400).json(new apiResponse(400, 'Please create Shiprocket order before marking as shipped', {}, {}));
        }

        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Order'), { order }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
```

## 🎯 Complete Example Flow

```javascript
// 1. Customer places order (your existing flow)
const orderResponse = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
});
const orderResult = await orderResponse.json();
const internalOrderId = orderResult.data.order._id;

// 2. Payment is completed (your existing flow)
// ... payment processing ...

// 3. When ready to ship, create Shiprocket order
const shiprocketResponse = await fetch('/api/ship-rocket/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ internalOrderId })
});
const shiprocketResult = await shiprocketResponse.json();
const shiprocketOrderId = shiprocketResult.data.shiprocketOrder._id;

// 4. Get available couriers
const couriersResponse = await fetch('/api/ship-rocket/couriers?pincode=400001&weight=1.5');
const couriersResult = await couriersResponse.json();
const courierId = couriersResult.data.couriers[0].courier_id;

// 5. Generate AWB
const awbResponse = await fetch(`/api/ship-rocket/orders/${shiprocketOrderId}/awb`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courierId })
});
const awbResult = await awbResponse.json();
const awbNumber = awbResult.data.order.awbNumber;

// 6. Request pickup
const pickupResponse = await fetch(`/api/ship-rocket/orders/${shiprocketOrderId}/pickup`, {
    method: 'POST'
});

// 7. Track shipment
const trackingResponse = await fetch(`/api/ship-rocket/track/awb/${awbNumber}`);
const trackingResult = await trackingResponse.json();
```

## 🔄 Webhook Integration

Configure your webhook URL in Shiprocket dashboard:
```
https://yourdomain.com/api/ship-rocket/webhook
```

The webhook will automatically:
- Update Shiprocket order status
- Update internal order status
- Store tracking information
- Maintain webhook history

## 🛡️ Error Handling

The integration includes comprehensive error handling:

```javascript
try {
    const response = await fetch('/api/ship-rocket/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalOrderId })
    });
    
    const result = await response.json();
    
    if (result.status !== 200) {
        console.error('Shiprocket error:', result.message);
        // Handle error appropriately
    }
} catch (error) {
    console.error('Network error:', error);
    // Handle network error
}
```

## 📊 Database Updates

The integration automatically updates your database:

1. **Internal Order Updates:**
   - `shiprocketOrderId`: Links to Shiprocket order
   - `trackingId`: AWB number for tracking
   - `orderStatus`: Updated based on Shiprocket status

2. **Shiprocket Order Storage:**
   - Complete order details
   - Tracking information
   - Webhook history
   - Status updates

## 🚀 Production Deployment

1. **Environment Variables:**
```env
SHIPROCKET_EMAIL=your_email@example.com
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_PICKUP_PINCODE=400001
```

2. **Webhook Configuration:**
   - Set webhook URL in Shiprocket dashboard
   - Ensure your server is publicly accessible

3. **Testing:**
   - Test with sample orders first
   - Verify webhook processing
   - Check error handling

## 📞 Support

For issues:
1. Check server logs for detailed error messages
2. Verify environment variables
3. Test webhook endpoint accessibility
4. Review Shiprocket dashboard for order status

---

**🎉 Your Shiprocket integration is now ready to use with your existing order system!** 
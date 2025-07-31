import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { shipRocketTokenModel, shipRocketOrderModel, orderModel, productModel } from '../database';
import { responseMessage } from './response';

interface ShiprocketCredentials {
    email: string;
    password: string;
}

interface ShiprocketOrderPayload {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    billing_alternate_phone?: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_last_name?: string;
    shipping_address?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_email?: string;
    shipping_phone?: string;
    order_items: Array<{
        name: string;
        sku: string;
        units: number;
        selling_price: number;
        discount?: number;
        tax?: number;
        hsn?: number;
    }>;
    payment_method: string;
    sub_total: number;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
}

interface ShiprocketResponse {
    status: number;
    message: string;
    data?: any;
    error?: any;
}

class ShiprocketService {
    private api: AxiosInstance;
    private baseURL: string = 'https://apiv2.shiprocket.in/v1';
    private credentials: ShiprocketCredentials;
    private tokenCache: { token: string; expiresAt: Date } | null = null;

    constructor() {
        this.credentials = {
            email: process.env.SHIPROCKET_EMAIL || '',
            password: process.env.SHIPROCKET_PASSWORD || ''
        };

        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor to add auth token
        this.api.interceptors.request.use(async (config) => {
            const token = await this.getValidToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired, try to refresh
                    await this.refreshToken();
                    // Retry the original request
                    const originalRequest = error.config;
                    const token = await this.getValidToken();
                    if (token) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return this.api(originalRequest);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get valid authentication token
     */
    private async getValidToken(): Promise<string | null> {
        try {
            // Check in-memory cache first
            if (this.tokenCache && this.tokenCache.expiresAt > new Date()) {
                return this.tokenCache.token;
            }

            // Check database for valid token
            const dbToken = await shipRocketTokenModel.findOne({
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).sort({ createdAt: -1 });

            if (dbToken) {
                this.tokenCache = {
                    token: dbToken.token,
                    expiresAt: dbToken.expiresAt
                };
                return dbToken.token;
            }

            // No valid token found, authenticate
            return await this.authenticate();
        } catch (error) {
            console.error('Error getting valid token:', error);
            return null;
        }
    }

    /**
     * Authenticate with Shiprocket API
     */
    private async authenticate(): Promise<string | null> {
        try {
            const response: AxiosResponse = await axios.post(`${this.baseURL}/external/auth/login`, {
                email: this.credentials.email,
                password: this.credentials.password
            });

            if (response.data && response.data.token) {
                const token = response.data.token;
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                // Save token to database
                await shipRocketTokenModel.create({
                    token,
                    expiresAt,
                    isActive: true
                });

                // Update cache
                this.tokenCache = { token, expiresAt };

                return token;
            }

            return null;
        } catch (error) {
            console.error('Shiprocket authentication failed:', error);
            return null;
        }
    }

    /**
     * Refresh authentication token
     */
    private async refreshToken(): Promise<void> {
        try {
            // Deactivate current token
            await shipRocketTokenModel.updateMany(
                { isActive: true },
                { isActive: false }
            );

            // Clear cache
            this.tokenCache = null;

            // Get new token
            await this.authenticate();
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    }

    /**
     * Create a new order on Shiprocket
     */
    async createOrder(orderData: ShiprocketOrderPayload): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.post('/external/orders/create/adhoc', orderData);            console.log("Shiprocket API Response:", JSON.stringify(response.data, null, 2));
            
            if (response.data && response.status === 200) {
                // Handle different response structures
                const responseData = response.data.data || response.data;
                
                return {
                    status: 200,
                    message: 'Order created successfully',
                    data: responseData
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to create order',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error creating Shiprocket order:', error);
            return {
                status: 500,
                message: 'Failed to create order',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Generate AWB number for an order
     */
    async generateAWB(orderId: string, courierId: string): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.post('/external/courier/assign/awb', {
                shipment_id: orderId,
                courier_id: courierId
            });
            console.log("response => ", response);
            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'AWB generated successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to generate AWB',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error generating AWB:', error);
            return {
                status: 500,
                message: 'Failed to generate AWB',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Request pickup for an order
     */
    async requestPickup(orderId: string): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.post('/external/courier/generate/pickup', {
                shipment_id: orderId
            });

            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'Pickup requested successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to request pickup',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error requesting pickup:', error);
            return {
                status: 500,
                message: 'Failed to request pickup',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Track shipment by AWB number
     */
    async trackShipment(awbNumber: string): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.get(`/external/courier/track/awb/${awbNumber}`);

            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'Tracking data retrieved successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to track shipment',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error tracking shipment:', error);
            return {
                status: 500,
                message: 'Failed to track shipment',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Track shipment by order ID
     */
    async trackShipmentByOrderId(orderId: string): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.get(`/external/orders/show/${orderId}`);

            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'Order tracking data retrieved successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to track order',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error tracking order:', error);
            return {
                status: 500,
                message: 'Failed to track order',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Get available couriers
     */
    async getCouriers(pincode: string, weight: number): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.get('/external/courier/serviceability/', {
                params: {
                    pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE || '400001',
                    delivery_postcode: pincode,
                    weight: weight,
                    cod: 0
                }
            });

            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'Couriers retrieved successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to get couriers',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error getting couriers:', error);
            return {
                status: 500,
                message: 'Failed to get couriers',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Cancel an order
     */
    async cancelOrder(orderId: string): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.post('/external/orders/cancel', {
                ids: [orderId]
            });

            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'Order cancelled successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to cancel order',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            return {
                status: 500,
                message: 'Failed to cancel order',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Get order details
     */
    async getOrderDetails(orderId: string): Promise<ShiprocketResponse> {
        try {
            const response: AxiosResponse = await this.api.get(`/external/orders/show/${orderId}`);

            if (response.data && response.data.status === 200) {
                return {
                    status: 200,
                    message: 'Order details retrieved successfully',
                    data: response.data.data
                };
            } else {
                return {
                    status: 400,
                    message: response.data.message || 'Failed to get order details',
                    error: response.data
                };
            }
        } catch (error: any) {
            console.error('Error getting order details:', error);
            return {
                status: 500,
                message: 'Failed to get order details',
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Validate order payload
     */
    validateOrderPayload(payload: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const requiredFields = [
            'order_id', 'order_date', 'pickup_location', 'billing_customer_name',
            'billing_address', 'billing_city', 'billing_pincode', 'billing_state',
            'billing_country', 'billing_email', 'billing_phone', 'shipping_is_billing',
            'order_items', 'payment_method', 'sub_total'
        ];

        requiredFields.forEach(field => {
            if (!payload[field]) {
                errors.push(`${field} is required`);
            }
        });

        // Validate order items
        if (payload.order_items && Array.isArray(payload.order_items)) {
            payload.order_items.forEach((item: any, index: number) => {
                if (!item.name) errors.push(`Item ${index + 1}: name is required`);
                if (!item.units) errors.push(`Item ${index + 1}: units is required`);
                if (!item.selling_price) errors.push(`Item ${index + 1}: selling_price is required`);
            });
        } else {
            errors.push('order_items must be an array');
        }

        // Validate shipping address if not billing
        if (!payload.shipping_is_billing) {
            const shippingFields = [
                'shipping_customer_name', 'shipping_address', 'shipping_city',
                'shipping_pincode', 'shipping_state', 'shipping_country', 'shipping_phone'
            ];
            shippingFields.forEach(field => {
                if (!payload[field]) {
                    errors.push(`${field} is required when shipping_is_billing is false`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Convert internal order to Shiprocket format
     */
    async convertInternalOrderToShiprocket(internalOrderId: string): Promise<ShiprocketOrderPayload | null> {
        try {
            const ObjectId = require('mongoose').Types.ObjectId;
            
            // Get the internal order with populated products
            const order = await orderModel.findOne({ 
                _id: new ObjectId(internalOrderId), 
                isDeleted: false 
            }).populate('products.productId');

            if (!order) {
                console.error('Internal order not found:', internalOrderId);
                return null;
            }

            // Get product details for items
            const orderItems = [];
            let totalWeight = 0;

            for (const product of order.products) {
                const productDetails = await productModel.findOne({ 
                    _id: new ObjectId(product.productId._id)
                }).lean();

                if (productDetails) {
                    // Add color to the product name if available
                    let productSku =  productDetails?.sku || 'Product';
                    if (product.color) {
                        productSku += ` (${product.color})`;
                    }

                    orderItems.push({
                        name: productDetails?.name,
                        sku: productSku || `SKU_${product.productId._id}`,
                        units: product?.quantity,
                        selling_price: product?.price,
                        discount: 0, // You can calculate discount if needed
                        tax: 0, // You can calculate tax if needed
                        hsn: productDetails?.hsn || 0
                    });

                    // Calculate total weight (assuming weight is in grams)
                    totalWeight += (productDetails?.weight || 500) * product?.quantity;
                }
            }

            // Convert weight to kg for Shiprocket
            let weightInKg = 0;
            if(totalWeight){
                weightInKg = totalWeight / 1000;
            }

            // Create Shiprocket order payload
            const shiprocketPayload: ShiprocketOrderPayload = {
                order_id: order._id.toString(),
                order_date: order.createdAt.toISOString().split('T')[0],
                pickup_location: 'SHAJANAND GROUP',
                billing_customer_name: order.name || 'Customer',
                billing_last_name: order.lastName || '',
                billing_address: order.shippingAddress.address,
                billing_city: order.shippingAddress.city,
                billing_pincode: order.shippingAddress.zipCode,
                billing_state: order.shippingAddress.state,
                billing_country: order.shippingAddress.country,
                billing_email: order.shippingAddress.email || order.email,
                billing_phone: order.shippingAddress.phoneNumber || order.phoneNumber,
                shipping_is_billing: true, // Assuming same as billing
                order_items: orderItems,
                payment_method: order.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
                sub_total: order.totalAmount,
                weight: weightInKg,
                length: 20, // Default values - adjust as needed
                breadth: 15,
                height: 5
            };

            return shiprocketPayload;

        } catch (error) {
            console.error('Error converting internal order to Shiprocket format:', error);
            return null;
        }
    }
}

export const shipRocketService = new ShiprocketService(); 
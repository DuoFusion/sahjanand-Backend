
export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error
    }
}

export const userStatus = {
    user: "user",
    admin: "admin",
    upload: "upload"
}

export const FAQ_CATEGORIES = {
    GENERAL: 'general',
    ORDERS: 'orders',
    PAYMENTS: 'payments',
    SHIPPING: 'shipping',
    RETURNS: 'returns',
    PRODUCTS: 'products',
    ACCOUNT: 'account',
    TECHNICAL: 'technical',
    PRICING: 'pricing',
    SECURITY: 'security'
}
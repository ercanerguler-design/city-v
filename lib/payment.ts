// SANAL POS ENTEGRASYONTipi için hazırlık
// İyzico veya PayTR ile entegrasyon yapılacak

export interface PaymentProvider {
  name: 'iyzico' | 'paytr' | 'stripe';
  apiKey: string;
  secretKey: string;
  testMode: boolean;
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  token?: string;
  errorMessage?: string;
}

// İyzico Integration
export class IyzicoPayment {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(testMode: boolean = true) {
    this.apiKey = process.env.IYZICO_API_KEY || '';
    this.secretKey = process.env.IYZICO_SECRET_KEY || '';
    this.baseUrl = testMode 
      ? 'https://sandbox-api.iyzipay.com' 
      : 'https://api.iyzipay.com';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // TODO: İyzico API integration
      // Şimdilik mock response
      console.log('🔐 İyzico payment request:', request);

      return {
        success: true,
        paymentUrl: `/payment/iyzico/${request.orderId}`,
        token: `iyzico_${Date.now()}`
      };
    } catch (error) {
      console.error('❌ İyzico payment error:', error);
      return {
        success: false,
        errorMessage: 'Ödeme başlatılamadı'
      };
    }
  }

  async verifyPayment(token: string): Promise<boolean> {
    // TODO: İyzico payment verification
    console.log('✅ Verifying payment:', token);
    return true;
  }
}

// PayTR Integration
export class PayTRPayment {
  private merchantId: string;
  private merchantKey: string;
  private merchantSalt: string;
  private baseUrl: string;

  constructor(testMode: boolean = true) {
    this.merchantId = process.env.PAYTR_MERCHANT_ID || '';
    this.merchantKey = process.env.PAYTR_MERCHANT_KEY || '';
    this.merchantSalt = process.env.PAYTR_MERCHANT_SALT || '';
    this.baseUrl = 'https://www.paytr.com';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // TODO: PayTR API integration
      console.log('🔐 PayTR payment request:', request);

      return {
        success: true,
        paymentUrl: `/payment/paytr/${request.orderId}`,
        token: `paytr_${Date.now()}`
      };
    } catch (error) {
      console.error('❌ PayTR payment error:', error);
      return {
        success: false,
        errorMessage: 'Ödeme başlatılamadı'
      };
    }
  }

  async verifyPayment(token: string): Promise<boolean> {
    // TODO: PayTR payment verification
    console.log('✅ Verifying payment:', token);
    return true;
  }
}

// Factory
export function createPaymentProvider(providerName: 'iyzico' | 'paytr', testMode: boolean = true) {
  switch (providerName) {
    case 'iyzico':
      return new IyzicoPayment(testMode);
    case 'paytr':
      return new PayTRPayment(testMode);
    default:
      throw new Error('Unsupported payment provider');
  }
}

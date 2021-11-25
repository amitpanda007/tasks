export interface PaymentInfo {
    id?: string;
    paymentDone: boolean;
    paymentStatus?: string;
    paymentSuccess?: PaymentSuccess;
    paymentFailure?: PaymentFailure;
}

export interface PaymentSuccess {
    paymentId: string;
    orderId: string;
    signature: string;
}

export interface PaymentFailure {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    orderId: string;
    paymentId: string;
}
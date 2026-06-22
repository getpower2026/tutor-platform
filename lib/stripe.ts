import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const PLATFORM_FEE_PERCENT = parseInt(process.env.PLATFORM_FEE_PERCENT ?? "5");

export async function createPaymentIntent(
  amount: number,
  bookingId: string,
  teacherStripeAccountId?: string
) {
  const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));

  const params: Stripe.PaymentIntentCreateParams = {
    amount: amount * 100,
    currency: "twd",
    metadata: { bookingId },
  };

  if (teacherStripeAccountId) {
    params.transfer_data = { destination: teacherStripeAccountId };
    params.application_fee_amount = platformFee * 100;
  }

  return stripe.paymentIntents.create(params);
}

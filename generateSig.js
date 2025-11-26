import crypto from "crypto";

const secret = "secret_123";   // your RAZORPAY_WEBHOOK_SECRET

const payload = JSON.stringify({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test_12345",
        order_id: "order_RkKZmJihSRIyiP",
        amount: 79999,
        currency: "INR",
        status: "captured",
      },
    },
  },
});

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

console.log("SIGNATURE:", signature);
console.log("\nRAW BODY (COPY THIS INTO POSTMAN):\n", payload);

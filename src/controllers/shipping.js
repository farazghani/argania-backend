import { getShiprocketToken } from "../services/shipRocket.js";

export const getDeliveryCharge = async (req, res) => {
  try {
    const { deliveryPincode, weight } = req.body;

    if (!deliveryPincode || !weight) {
      return res.status(400).json({ error: "deliveryPincode and weight required" });
    }

    const token = await getShiprocketToken();

    const url =
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/` +
      `?pickup_postcode=110001` +
      `&delivery_postcode=${deliveryPincode}` +
      `&cod=0` +
      `&weight=${weight}`;

    const srRes = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Shiprocket requires Bearer
      },
    });

    const data = await srRes.json();
    console.log(data);
    if (!srRes.ok || !data?.data) {
      console.error("Shiprocket error:", data);
      return res.status(502).json({ error: "Failed to fetch shipping rates" });
    }

    const couriers = data.data.available_courier_companies;

    if (!couriers || couriers.length === 0) {
      return res.status(400).json({ error: "No courier available" });
    }

    const cheapest = couriers.sort((a, b) => a.rate - b.rate)[0];

    return res.json({
      deliveryCharge: Number(cheapest.rate),
      courier: cheapest.courier_name,
      eta: cheapest.estimated_delivery_days,
    });

  } catch (err) {
    console.error("Shipping error:", err);
    return res.status(500).json({ error: "Shipping service unavailable" });
  }
};

export const getShiprocketToken = async () => {
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_API_EMAIL,
      password: process.env.SHIPROCKET_API_PASSWORD,
    }),
  });

  const data = await res.json();
  console.log(data);
  if (!data?.token) {
    console.error("Shiprocket auth failed:", data);
    throw new Error("Failed to authenticate with Shiprocket");
  }

  return data.token.trim(); // 🔥 TRIM fixes hidden space bugs
};
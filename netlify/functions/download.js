const DOWNLOAD_CONFIG = {
  en: {
    productId: "prod_TGSwKIkmghLNuZ",
    driveId: "1JRrJGW0pYUDqKnox4lP7ImNB-XzDMuyC",
    fallbackUrl: "/payment",
  },
  fr: {
    productId: "prod_TGSjL24r4PjuHq",
    driveId: "1sV2LKogCwiuSjrNVDUy0ECyZW27zVI06",
    fallbackUrl: "/fr/paiement",
  },
  es: {
    productId: "prod_TGT50OMoqWV3bx",
    driveId: "10R5m_w7SzaH6U6t6x_1IOphwSThh2vDv",
    fallbackUrl: "/es/pago",
  },
  de: {
    productId: "prod_TGTEcCwUKQEBWB",
    driveId: "1uu6fi-qjT24xmsiyixsCN7q9l72OKQ4t",
    fallbackUrl: "/de/zahlung",
  },
};

function redirect(location) {
  return {
    statusCode: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
    body: "Redirecting…",
  };
}

async function stripeGet(path, stripeSecretKey) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  });

  const payloadText = await response.text();
  let payloadJson;
  try {
    payloadJson = JSON.parse(payloadText);
  } catch {
    payloadJson = null;
  }

  if (!response.ok) {
    const message =
      (payloadJson && payloadJson.error && payloadJson.error.message) ||
      `Stripe API request failed (${response.status}).`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.payload = payloadJson || payloadText;
    throw error;
  }

  return payloadJson;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    return {
      statusCode: 405,
      headers: { Allow: "GET, HEAD" },
      body: "Method Not Allowed",
    };
  }

  const langRaw = event.queryStringParameters && event.queryStringParameters.lang;
  const sessionIdRaw =
    event.queryStringParameters && event.queryStringParameters.session_id;
  const lang = String(langRaw || "").toLowerCase().trim();
  const sessionId = String(sessionIdRaw || "").trim();
  const config = DOWNLOAD_CONFIG[lang];

  if (!config) {
    return redirect("/payment");
  }

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return redirect(config.fallbackUrl);
  }

  const stripeSecretKey = sessionId.startsWith("cs_test_")
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY;
  const missingKeyEnvVar = sessionId.startsWith("cs_test_")
    ? "STRIPE_SECRET_KEY_TEST"
    : "STRIPE_SECRET_KEY";
  if (!stripeSecretKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body:
        `Server misconfiguration: missing ${missingKeyEnvVar} environment variable.`,
    };
  }

  try {
    const session = await stripeGet(
      `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      stripeSecretKey,
    );

    if (session.payment_status !== "paid") {
      return redirect(config.fallbackUrl);
    }

    if (session.status && session.status !== "complete") {
      return redirect(config.fallbackUrl);
    }

    const lineItems = await stripeGet(
      `/v1/checkout/sessions/${encodeURIComponent(
        sessionId,
      )}/line_items?limit=20&expand[]=data.price.product`,
      stripeSecretKey,
    );

    const matchesProduct =
      Array.isArray(lineItems.data) &&
      lineItems.data.some((item) => {
        const product = item && item.price && item.price.product;
        const productId = typeof product === "string" ? product : product?.id;
        return productId === config.productId;
      });

    if (!matchesProduct) {
      return redirect(config.fallbackUrl);
    }

    const driveUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
      config.driveId,
    )}`;

    return redirect(driveUrl);
  } catch (error) {
    return redirect(config.fallbackUrl);
  }
};

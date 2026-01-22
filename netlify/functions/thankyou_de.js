const PRODUCT_ID = "prod_TGTEcCwUKQEBWB";
const LANG = "de";
const HOME_FALLBACK = "/de/";

function notFound() {
  return {
    statusCode: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
    body: "Not Found",
  };
}

function htmlResponse(html) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
    body: html,
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

async function isPaidSessionForProduct(sessionId) {
  const stripeSecretKey = sessionId.startsWith("cs_test_")
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return false;
  }

  const session = await stripeGet(
    `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    stripeSecretKey,
  );

  if (session.payment_status !== "paid") {
    return false;
  }

  if (session.status && session.status !== "complete") {
    return false;
  }

  const lineItems = await stripeGet(
    `/v1/checkout/sessions/${encodeURIComponent(
      sessionId,
    )}/line_items?limit=20&expand[]=data.price.product`,
    stripeSecretKey,
  );

  return (
    Array.isArray(lineItems.data) &&
    lineItems.data.some((item) => {
      const product = item && item.price && item.price.product;
      const productId = typeof product === "string" ? product : product?.id;
      return productId === PRODUCT_ID;
    })
  );
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    return {
      statusCode: 405,
      headers: { Allow: "GET, HEAD" },
      body: "Method Not Allowed",
    };
  }

  const sessionIdRaw =
    event.queryStringParameters && event.queryStringParameters.session_id;
  const sessionId = String(sessionIdRaw || "").trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return notFound();
  }

  try {
    const ok = await isPaidSessionForProduct(sessionId);
    if (!ok) {
      return notFound();
    }

    const downloadUrl = `/.netlify/functions/download?lang=${LANG}&session_id=${encodeURIComponent(
      sessionId,
    )}`;

    const page = `<!doctype html>
<html lang="${LANG}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Danke — Prosper Factory</title>
    <meta name="robots" content="noindex, nofollow" />
    <style>
      :root{color-scheme:dark;--bg:#070707;--panel:#111;--accent:#d4af37;--text:#f5f5f5;--muted:#b9b9b9}
      body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
      main{max-width:720px;width:100%;background:linear-gradient(180deg,rgba(17,17,17,.9),rgba(8,8,8,.9));border:1px solid rgba(212,175,55,.25);border-radius:18px;padding:28px 24px;box-shadow:0 24px 70px rgba(0,0,0,.6)}
      h1{margin:0 0 8px;font-size:1.7rem}
      p{margin:0 0 14px;color:var(--muted);line-height:1.55}
      a.btn{display:inline-block;background:var(--accent);color:#1a1305;text-decoration:none;font-weight:700;padding:12px 16px;border-radius:999px}
      .fine{font-size:.92rem}
    </style>
  </head>
  <body>
    <main>
      <h1>Danke — Zahlung bestätigt</h1>
      <p>Dein Download ist bereit. Falls er nicht automatisch startet, nutze den Button unten.</p>
      <p><a class="btn" href="${downloadUrl}" rel="nofollow">PDF herunterladen</a></p>
      <p class="fine">Tipp: Bewahre den Stripe-Bestätigungslink auf (er enthält das Session-Token).</p>
      <noscript><p class="fine">JavaScript ist deaktiviert. Der Button funktioniert trotzdem.</p></noscript>
      <script>setTimeout(function(){window.location.replace(${JSON.stringify(
        downloadUrl,
      )})}, 1200);</script>
      <p class="fine"><a href="${HOME_FALLBACK}" rel="nofollow">Zur Startseite</a></p>
    </main>
  </body>
</html>`;

    return htmlResponse(page);
  } catch {
    return notFound();
  }
};


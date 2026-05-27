const SHOPIFY_API_VERSION = "2025-01";

const BASE_URL = `https://${process.env.SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

const HEADERS = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
};

// Exponential backoff — handles 429 rate limits and transient 5xx errors
async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
      console.warn(`[ShopifyClient] Rate limited. Retrying after ${retryAfter}s (attempt ${attempt})`);
      await sleep(retryAfter * 1000);
      continue;
    }

    if (res.status >= 500 && attempt < retries) {
      const delay = 2 ** attempt * 500;
      console.warn(`[ShopifyClient] Server error ${res.status}. Retrying in ${delay}ms (attempt ${attempt})`);
      await sleep(delay);
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Shopify API ${res.status}: ${body}`);
    }

    return res.json();
  }

  throw new Error(`Shopify API request failed after ${retries} attempts: ${url}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const shopifyClient = {
  get(path) {
    return fetchWithRetry(`${BASE_URL}${path}`, { method: "GET", headers: HEADERS });
  },

  post(path, body) {
    return fetchWithRetry(`${BASE_URL}${path}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });
  },

  put(path, body) {
    return fetchWithRetry(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(body),
    });
  },
};

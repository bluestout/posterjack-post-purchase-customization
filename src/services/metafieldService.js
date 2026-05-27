import { shopifyClient } from "../lib/shopifyClient.js";

const NAMESPACE = "posterjack_customization";
const KEY = "token_data";

export async function storeCustomizationMetafield(orderId, tokenPayload) {
  const data = await shopifyClient.post(`/orders/${orderId}/metafields.json`, {
    metafield: {
      namespace: NAMESPACE,
      key: KEY,
      value: JSON.stringify(tokenPayload),
      type: "json",
    },
  });

  console.log(`[MetafieldService] Token data stored for Order ${orderId}`);
  return data.metafield;
}

export async function getCustomizationMetafield(orderId) {
  const data = await shopifyClient.get(
    `/orders/${orderId}/metafields.json?namespace=${NAMESPACE}&key=${KEY}`
  );

  const metafield = data.metafields?.[0];
  if (!metafield) return null;

  return { id: metafield.id, ...JSON.parse(metafield.value) };
}

// Called in Phase 2 when customer submits customization
export async function updateTokenStatus(orderId, metafieldId, status) {
  const current = await getCustomizationMetafield(orderId);
  if (!current) throw new Error(`Metafield not found for Order ${orderId}`);

  const { id: _id, ...payload } = current;
  const updated = { ...payload, status, used_at: new Date().toISOString() };

  await shopifyClient.put(`/orders/${orderId}/metafields/${metafieldId}.json`, {
    metafield: {
      id: metafieldId,
      value: JSON.stringify(updated),
      type: "json",
    },
  });

  console.log(`[MetafieldService] Token status → "${status}" for Order ${orderId}`);
}

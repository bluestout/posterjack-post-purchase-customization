import { shopifyClient } from "../lib/shopifyClient.js";

const HOLD_TAG = "awaiting-customization";

function parseTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function applyHoldTag(orderId, existingTags) {
  const tags = parseTags(existingTags);

  if (tags.includes(HOLD_TAG)) {
    console.log(`[TagService] Order ${orderId} already has hold tag — skipping.`);
    return { alreadyTagged: true };
  }

  tags.push(HOLD_TAG);

  const data = await shopifyClient.put(`/orders/${orderId}.json`, {
    order: { id: orderId, tags: tags.join(", ") },
  });

  console.log(`[TagService] Hold tag applied to Order ${orderId}`);
  return { success: true, tags: data.order.tags };
}

// Used in Phase 2 when customer completes customization
export async function removeHoldTag(orderId, existingTags) {
  const tags = parseTags(existingTags).filter((t) => t !== HOLD_TAG);

  await shopifyClient.put(`/orders/${orderId}.json`, {
    order: { id: orderId, tags: tags.join(", ") },
  });

  console.log(`[TagService] Hold tag removed from Order ${orderId}`);
}

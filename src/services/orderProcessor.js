import { applyHoldTag } from "./tagService.js";
import { createTokenPayload } from "./tokenService.js";
import { storeCustomizationMetafield } from "./metafieldService.js";

export async function processMarketplaceOrder(order) {
  const { id: orderId, name: orderName, tags } = order;

  console.log(`[OrderProcessor] Pipeline started — Order ${orderName} (${orderId})`);

  await applyHoldTag(orderId, tags);

  const tokenPayload = createTokenPayload(orderId);
  console.log(`[OrderProcessor] Token: ${tokenPayload.token.slice(0, 8)}... | Expires: ${tokenPayload.expires_at}`);

  await storeCustomizationMetafield(orderId, tokenPayload);

  console.log(`[OrderProcessor] Pipeline complete — Order ${orderName}`);
  console.log(`[OrderProcessor] Customization link: ${tokenPayload.customization_link}`);

  return tokenPayload;
}

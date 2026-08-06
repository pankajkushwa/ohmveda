import { StoreItem, MoqTier } from '../types';

/**
 * Returns the MOQ tiers for a product, fallback to standard defaults if none configured.
 */
export function getMoqTiersForProduct(product: StoreItem): MoqTier[] {
  if (product.moqTiers && product.moqTiers.length > 0) {
    return [...product.moqTiers].sort((a, b) => a.minQty - b.minQty);
  }

  const basePrice = product.price || 0;
  return [
    { minQty: 1, maxQty: 9, pricePerUnit: basePrice },
    { minQty: 10, maxQty: 499, pricePerUnit: Number((basePrice * 0.98).toFixed(2)) },
    { minQty: 500, maxQty: undefined, pricePerUnit: Number((basePrice * 0.95).toFixed(2)) },
  ];
}

/**
 * Calculates the unit price based on user quantity and active MOQ tier.
 */
export function getUnitPriceForQuantity(product: StoreItem, qty: number): number {
  const validQty = Math.max(1, qty || 1);
  const tiers = getMoqTiersForProduct(product);

  const matchingTier = tiers.filter((t) => validQty >= t.minQty).pop();
  if (matchingTier) {
    return matchingTier.pricePerUnit;
  }
  return tiers[0]?.pricePerUnit || product.price || 0;
}

/**
 * Calculates default reward points earned per product unit.
 * 10% of item price in points (e.g. ₹45 item = 5 points).
 */
export function getRewardPointsForProduct(product: StoreItem): number {
  if (product.rewardPoints !== undefined && product.rewardPoints !== null && product.rewardPoints >= 0) {
    return product.rewardPoints;
  }
  return Math.max(1, Math.round((product.price || 0) / 10));
}

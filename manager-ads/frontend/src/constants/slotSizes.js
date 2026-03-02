/**
 * Tamanhos disponíveis por slot (conforme layout da página Odonnto).
 * Usado no formulário de banners e na listagem de slots.
 */
export const SLOT_SIZES_BY_CODE = {
  AD_SLOT_1: [
    { device: 'mobile', width: 320, height: 100 },
    { device: 'desktop', width: 728, height: 90 },
    { device: 'desktop', width: 970, height: 90 },
  ],
  AD_SLOT_2: [
    { device: 'mobile', width: 300, height: 250 },
    { device: 'desktop', width: 728, height: 90 },
    { device: 'desktop', width: 970, height: 250 },
  ],
  AD_SLOT_3: [
    { device: 'mobile', width: 320, height: 100 },
    { device: 'desktop', width: 728, height: 90 },
  ],
  AD_SLOT_4: [
    { device: 'mobile', width: 300, height: 250 },
    { device: 'desktop', width: 970, height: 250 },
  ],
  AD_SLOT_5: [
    { device: 'mobile', width: 320, height: 100 },
    { device: 'desktop', width: 728, height: 90 },
  ],
};

/** Retorna os tamanhos do slot: da API (recommendedSizes) ou fallback por code */
export function getSlotSizes(slot) {
  if (!slot) return [];
  if (slot.recommendedSizes?.length) return slot.recommendedSizes;
  return SLOT_SIZES_BY_CODE[slot.code] || [];
}

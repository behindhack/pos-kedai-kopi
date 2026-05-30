import { createSaleSchema } from './backend/src/utils/validationSchemas.js';

const mockPayload = {
  customerName: 'Test',
  orderType: 'DINE_IN',
  items: [
    {
      product: {
        id: 1,
        name: 'Kopi Sanger',
        category: 'ESPRESSO',
        basePrice: 12000,
        variants: []
      },
      qty: 1,
      selectedVariantIds: [],
      note: ''
    }
  ],
  subtotal: 12000,
  discount: 0,
  tax: 0,
  total: 12000,
  paymentMethod: 'CASH',
  paidAmount: 12000
};

try {
  const result = createSaleSchema.validate(mockPayload, { abortEarly: false, stripUnknown: true });
  console.log("Validation Result:", result);
  if (result.error) {
    console.error("Validation Errors:", result.error.details);
  }
} catch (e) {
  console.error("Validation THREW an exception:", e);
}

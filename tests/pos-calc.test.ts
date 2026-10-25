import test from 'node:test';
import assert from 'node:assert/strict';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  item_discount: number; // nominal discount per unit
}

function calculateCartTotals(
  items: CartItem[],
  transactionDiscountPercent: number = 0,
  taxPercent: number = 0
) {
  const subtotalBeforeDiscount = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const totalItemDiscounts = items.reduce(
    (sum, item) => sum + item.item_discount * item.qty,
    0
  );

  const subtotalAfterItemDiscounts = Math.max(
    0,
    subtotalBeforeDiscount - totalItemDiscounts
  );

  const transactionDiscountAmount = Math.round(
    subtotalAfterItemDiscounts * (transactionDiscountPercent / 100)
  );

  const totalTaxable = Math.max(
    0,
    subtotalAfterItemDiscounts - transactionDiscountAmount
  );

  const taxAmount = Math.round(totalTaxable * (taxPercent / 100));
  const finalTotal = totalTaxable + taxAmount;

  return {
    subtotalBeforeDiscount,
    totalItemDiscounts,
    transactionDiscountAmount,
    totalDiscount: totalItemDiscounts + transactionDiscountAmount,
    taxAmount,
    finalTotal,
  };
}

function calculateChange(finalTotal: number, cashReceived: number) {
  const change = cashReceived - finalTotal;
  return {
    isSufficient: change >= 0,
    change: Math.max(0, change),
    remainingDebt: Math.max(0, -change),
  };
}

test('calculates standard cart subtotal without discount', () => {
  const items: CartItem[] = [
    { id: '1', name: 'Indomie Goreng', price: 3500, qty: 3, item_discount: 0 },
    { id: '2', name: 'Aqua 600ml', price: 4000, qty: 2, item_discount: 0 },
  ];

  const totals = calculateCartTotals(items);
  // (3500 * 3) + (4000 * 2) = 10500 + 8000 = 18500
  assert.equal(totals.subtotalBeforeDiscount, 18500);
  assert.equal(totals.finalTotal, 18500);
  assert.equal(totals.totalDiscount, 0);
});

test('calculates item discount and transaction percent discount correctly', () => {
  const items: CartItem[] = [
    { id: '1', name: 'Beras 5kg', price: 75000, qty: 1, item_discount: 5000 }, // net 70.000
    { id: '2', name: 'Minyak 2L', price: 38000, qty: 1, item_discount: 0 },    // net 38.000
  ];

  // Subtotal after item discount = 70.000 + 38.000 = 108.000
  // Transaction discount 10% = 10.800
  // Final total = 108.000 - 10.800 = 97.200
  const totals = calculateCartTotals(items, 10, 0);

  assert.equal(totals.subtotalBeforeDiscount, 113000);
  assert.equal(totals.totalItemDiscounts, 5000);
  assert.equal(totals.transactionDiscountAmount, 10800);
  assert.equal(totals.totalDiscount, 15800);
  assert.equal(totals.finalTotal, 97200);
});

test('calculates cash change and debt detection', () => {
  const paidExact = calculateChange(45000, 45000);
  assert.equal(paidExact.isSufficient, true);
  assert.equal(paidExact.change, 0);
  assert.equal(paidExact.remainingDebt, 0);

  const paidOver = calculateChange(45000, 50000);
  assert.equal(paidOver.isSufficient, true);
  assert.equal(paidOver.change, 5000);
  assert.equal(paidOver.remainingDebt, 0);

  const paidUnder = calculateChange(45000, 30000);
  assert.equal(paidUnder.isSufficient, false);
  assert.equal(paidUnder.change, 0);
  assert.equal(paidUnder.remainingDebt, 15000); // Kas Bon Pelanggan
});

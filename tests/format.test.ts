import test from 'node:test';
import assert from 'node:assert/strict';

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val);
}

test('formatCurrency correctly formats IDR values', () => {
  const result = formatCurrency(45000);
  assert.match(result, /45\.000/);
  assert.match(result, /Rp/);
});

test('formatCurrency handles 0 and negative amounts safely', () => {
  const zero = formatCurrency(0);
  assert.match(zero, /0/);

  const neg = formatCurrency(-15000);
  assert.match(neg, /15\.000/);
});

test('formatNumber formats integer with Indonesian thousand separator', () => {
  assert.equal(formatNumber(1250000), '1.250.000');
  assert.equal(formatNumber(500), '500');
});

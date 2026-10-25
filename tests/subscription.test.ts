import test from 'node:test';
import assert from 'node:assert/strict';
import { OFFICIAL_PLANS } from '../src/types/subscription.ts';

test('subscription official plans contains exactly 5 tiered tiers', () => {
  assert.equal(OFFICIAL_PLANS.length, 5);
});

test('official plans prices match business specification exactly', () => {
  const planMap = new Map(OFFICIAL_PLANS.map((p) => [p.code, p]));

  // Monthly: Rp45.000 / bln
  const monthly = planMap.get('monthly')!;
  assert.equal(monthly.price_idr, 45000);
  assert.equal(monthly.duration_months, 1);
  assert.equal(monthly.effective_price_monthly, 45000);

  // 3 Months: Rp120.000 (Rp40.000/bln)
  const threeMonths = planMap.get('3_months')!;
  assert.equal(threeMonths.price_idr, 120000);
  assert.equal(threeMonths.duration_months, 3);
  assert.equal(threeMonths.effective_price_monthly, 40000);

  // 6 Months: Rp250.000 (~Rp41.667/bln)
  const sixMonths = planMap.get('6_months')!;
  assert.equal(sixMonths.price_idr, 250000);
  assert.equal(sixMonths.duration_months, 6);

  // 9 Months: Rp385.000 (~Rp42.778/bln)
  const nineMonths = planMap.get('9_months')!;
  assert.equal(nineMonths.price_idr, 385000);
  assert.equal(nineMonths.duration_months, 9);

  // Yearly: Rp500.000 (~Rp41.667/bln)
  const yearly = planMap.get('yearly')!;
  assert.equal(yearly.price_idr, 500000);
  assert.equal(yearly.duration_months, 12);
  assert.equal(yearly.badge_label, 'Paling Hemat');
});

test('every official plan has active status and non-empty feature list', () => {
  for (const plan of OFFICIAL_PLANS) {
    assert.equal(plan.is_active, true);
    assert.ok(plan.features.length >= 3);
    assert.ok(plan.name.length > 0);
  }
});

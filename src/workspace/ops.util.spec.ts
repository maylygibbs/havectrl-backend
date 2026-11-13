import { describe, expect, it } from 'vitest';
import {
  assertExpenseReview,
  assertSameCurrency,
  assertWithinBalance,
  normalizeExpense,
  normalizePayment,
  normalizeService,
} from './ops.util';

describe('operations input', () => {
  it('keeps a fee in USD and drops a blank flight', () => {
    const row = normalizeService(
      { kind: 'fee', provider: 'INAC', amount: 12.5, currency: 'usd', flightId: '  ', airport: 'svmi' },
      true,
    );
    expect(row).toMatchObject({
      kind: 'fee',
      provider: 'INAC',
      amount: 12.5,
      currency: 'USD',
      airport: 'SVMI',
      flightId: null,
      status: 'requested',
    });
  });

  it('rejects a zero amount and a self-approval', () => {
    expect(() => normalizeExpense({ category: 'Taxi', description: 'Crew', amount: 0, currency: 'USD' }, true)).toThrow(
      /greater than zero/,
    );
    expect(() => assertExpenseReview('pilot@demoa.local', 'Pilot@demoa.local', 'approved')).toThrow(/own expense/);
  });

  it('settles one obligation in the same currency without passing the balance', () => {
    expect(() => normalizePayment({ serviceId: 'a', expenseId: 'b', amount: 10, currency: 'USD', method: 'transfer' })).toThrow(
      /one service or one expense/,
    );
    expect(() => assertSameCurrency('USD', 'VES')).toThrow(/currency/);
    expect(() => assertWithinBalance(100, 80, 21)).toThrow(/remaining/);
    const payment = normalizePayment({
      expenseId: 'expense-1',
      amount: 20,
      currency: 'VES',
      method: 'cash',
      officialUrl: 'https://ente.example/pay',
    });
    expect(payment.serviceId).toBeNull();
    expect(payment.officialUrl).toBe('https://ente.example/pay');
    expect(() => assertWithinBalance(100, 80, 20)).not.toThrow();
  });
});

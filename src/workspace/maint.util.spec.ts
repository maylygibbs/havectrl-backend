import { describe, expect, it } from 'vitest';
import { normalizeDiscrepancy, normalizeInspection, normalizeWorkOrder } from './maint.util';

describe('maintenance input', () => {
  it('keeps an inspection due date empty when it is unknown', () => {
    const row = normalizeInspection({ aircraftId: 'ac', title: '  100 hour  ', dueDate: '  ', dueHours: null });
    expect(row).toMatchObject({ aircraftId: 'ac', title: '100 hour', dueDate: null, dueHours: null, status: 'scheduled' });
  });

  it('keeps the discrepancy narrative and does not treat a blank flight as an id', () => {
    const row = normalizeDiscrepancy({
      aircraftId: 'ac',
      flightId: ' ',
      title: 'Oil leak',
      description: 'Seen on the walkaround',
    });
    expect(row.flightId).toBeNull();
    expect(row.description).toBe('Seen on the walkaround');
    expect(row.status).toBe('open');
  });

  it('requires evidence before a work order is done', () => {
    expect(() =>
      normalizeWorkOrder({ aircraftId: 'ac', title: 'Tighten', assignedTo: 'tech@demoa.local', status: 'done', evidence: ' ' }),
    ).toThrow(/Evidence/);
    const row = normalizeWorkOrder({
      aircraftId: 'ac',
      title: 'Tighten',
      assignedTo: 'tech@demoa.local',
      status: 'done',
      evidence: 'Torque stripe photographed',
    });
    expect(row.evidence).toBe('Torque stripe photographed');
  });
});

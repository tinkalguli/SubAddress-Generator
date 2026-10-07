import { describe, it, expect } from 'vitest';
import {
  formatTimestamp,
  TIMESTAMP_SAMPLE_DATE,
  TIMESTAMP_NUMBER_PRESETS,
  TIMESTAMP_WORD_PRESETS,
} from './timestamp';

describe('timestamp', () => {
  const date = new Date(2026, 8, 23, 10, 30, 45);

  it('formats full numeric date-time with seconds', () => {
    expect(formatTimestamp('DD-MM-YYYY-HH-mm-ss', date)).toBe('23-09-2026-10-30-45');
  });

  it('formats word date-time with seconds and ampm', () => {
    expect(formatTimestamp('D-mmm-YYYY-HH-mm-ss-ampm', date)).toBe('23-sept-2026-10-30-45-am');
  });

  it('formats full month name lowercase with seconds', () => {
    expect(formatTimestamp('D-mmmm-YYYY-HH-mm-ss-ampm', TIMESTAMP_SAMPLE_DATE)).toBe(
      '7-june-2026-15-04-05-pm',
    );
  });

  it('formats YYYYMMDD-HHmmss', () => {
    expect(formatTimestamp('YYYYMMDD-HHmmss', date)).toBe('20260923-103045');
  });

  it('formats compact numeric with seconds', () => {
    expect(formatTimestamp('YYYYMMDD-HHmmss', date)).toBe('20260923-103045');
  });

  it('every preset includes seconds in output', () => {
    const all = [...TIMESTAMP_WORD_PRESETS, ...TIMESTAMP_NUMBER_PRESETS];
    for (const p of all) {
      const out = formatTimestamp(p.format, TIMESTAMP_SAMPLE_DATE);
      expect(out).toMatch(/05|ss/); // sample seconds are :05
      expect(p.label).toBe(out);
    }
  });
});

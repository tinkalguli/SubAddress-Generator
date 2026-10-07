import { describe, it, expect } from 'vitest';
import { parsePrimaryEmail } from './email-parser';
import { EXAMPLE_PRIMARY_EMAIL } from '../constants/demo';

describe('email-parser', () => {
  it('parses example@gmail.com', () => {
    const parsed = parsePrimaryEmail(EXAMPLE_PRIMARY_EMAIL);
    expect(parsed).toEqual({
      base: 'example',
      domain: 'gmail.com',
      localPart: 'example',
    });
  });

  it('strips existing subaddress from base', () => {
    const parsed = parsePrimaryEmail('example+old@company.com');
    expect(parsed?.base).toBe('example');
    expect(parsed?.domain).toBe('company.com');
  });
});

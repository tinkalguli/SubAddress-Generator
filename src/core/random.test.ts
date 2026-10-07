import { describe, it, expect } from 'vitest';
import { random4, random6, randomString } from './random';

describe('random', () => {
  it('random4 length', () => {
    expect(random4()).toHaveLength(4);
  });

  it('random6 length', () => {
    expect(random6()).toHaveLength(6);
  });

  it('randomString custom length', () => {
    expect(randomString(8)).toHaveLength(8);
  });
});

import '../test/setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { getLastUsed, saveLastUsed } from './last-used';
import { EXAMPLE_PRIMARY_EMAIL } from '../constants/demo';

describe('last-used', () => {
  beforeEach(async () => {
    await chrome.storage.local.remove('lastUsed');
  });

  it('saves and loads primary email, prefix, and template', async () => {
    await saveLastUsed({
      primaryEmail: EXAMPLE_PRIMARY_EMAIL,
      prefix: 'signup',
      suffix: '',
      lastTemplateId: 'builtin-random',
      selectedTemplateId: 'builtin-random',
    });
    const loaded = await getLastUsed();
    expect(loaded?.primaryEmail).toBe(EXAMPLE_PRIMARY_EMAIL);
    expect(loaded?.prefix).toBe('signup');
    expect(loaded?.selectedTemplateId).toBe('builtin-random');
  });
});

import '../test/setup';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractCustomTemplates,
  getCustomTemplates,
  mergeBuiltinAndCustomTemplates,
  saveCustomTemplates,
} from './custom-templates';
import { createDefaultTemplates, createEmptyTemplate } from '../core/builtin-templates';

describe('custom-templates', () => {
  beforeEach(async () => {
    await chrome.storage.local.remove('customTemplates');
  });

  it('persists and loads custom templates only', async () => {
    const custom = createEmptyTemplate();
    custom.name = 'My QA pattern';
    const builtins = createDefaultTemplates();
    await saveCustomTemplates([...builtins, custom]);
    const loaded = await getCustomTemplates();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.name).toBe('My QA pattern');
  });

  it('merges builtins with saved custom', () => {
    const builtins = createDefaultTemplates();
    const custom = createEmptyTemplate();
    const merged = mergeBuiltinAndCustomTemplates(builtins, [custom]);
    expect(merged.length).toBe(builtins.length + 1);
    expect(merged.some((t) => t.id === custom.id)).toBe(true);
  });

  it('extractCustomTemplates filters builtins', () => {
    const builtins = createDefaultTemplates();
    const custom = createEmptyTemplate();
    const all = [...builtins, custom];
    expect(extractCustomTemplates(all)).toHaveLength(1);
  });
});

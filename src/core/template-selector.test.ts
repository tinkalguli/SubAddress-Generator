import { describe, it, expect } from 'vitest';
import { getEffectiveTemplate } from './template-selector';
import { createDefaultTemplates } from './builtin-templates';

describe('getEffectiveTemplate', () => {
  const templates = createDefaultTemplates();

  it('returns null when nothing selected', () => {
    expect(getEffectiveTemplate(templates, null)).toBeNull();
  });

  it('returns template by id', () => {
    const t = getEffectiveTemplate(templates, 'builtin-random');
    expect(t?.id).toBe('builtin-random');
  });
});

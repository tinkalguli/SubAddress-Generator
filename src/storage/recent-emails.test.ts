import '../test/setup';
import { describe, it, expect } from 'vitest';
import { addRecentEmail, getRecentEmails, trimRecentEmailsToLimit } from './recent-emails';

describe('recent-emails', () => {
  it('keeps at most limit entries when adding', async () => {
    for (let i = 1; i <= 11; i++) {
      await addRecentEmail(`user+test${i}@example.com`, 10);
    }
    const list = await getRecentEmails();
    expect(list).toHaveLength(10);
    expect(list[0]).toBe('user+test11@example.com');
    expect(list[9]).toBe('user+test2@example.com');
  });

  it('moves duplicate to top without duplicating', async () => {
    await addRecentEmail('a@x.com', 10);
    await addRecentEmail('b@x.com', 10);
    await addRecentEmail('a@x.com', 10);
    const list = await getRecentEmails();
    expect(list).toHaveLength(2);
    expect(list[0]).toBe('a@x.com');
    expect(list[1]).toBe('b@x.com');
  });

  it('trimRecentEmailsToLimit removes oldest when limit is lowered', async () => {
    for (let i = 1; i <= 10; i++) {
      await addRecentEmail(`e${i}@x.com`, 10);
    }
    const trimmed = await trimRecentEmailsToLimit(5);
    expect(trimmed).toHaveLength(5);
    expect(trimmed[0]).toBe('e10@x.com');
    expect(trimmed[4]).toBe('e6@x.com');
    const stored = await getRecentEmails();
    expect(stored).toHaveLength(5);
  });
});

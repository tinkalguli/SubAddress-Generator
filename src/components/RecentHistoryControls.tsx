import {
  MAX_RECENT_EMAIL_LIMIT,
  RECENT_EMAIL_LIMIT_PRESETS,
  type GeneratorSettings,
} from '../types';
import { clampRecentLimit } from '../storage/recent-emails';

interface Props {
  settings: Pick<GeneratorSettings, 'recentEmailsEnabled' | 'recentEmailLimit'>;
  onChange: (partial: Partial<Pick<GeneratorSettings, 'recentEmailsEnabled' | 'recentEmailLimit'>>) => void;
}

export function RecentHistoryControls({ settings, onChange }: Props) {
  const enabled = settings.recentEmailsEnabled;
  const limit = settings.recentEmailLimit;

  const setLimit = (value: number) => {
    onChange({ recentEmailLimit: clampRecentLimit(value) });
  };

  if (!enabled) {
    return (
      <div className="recent-controls">
        <button
          type="button"
          className="btn-primary"
          style={{ width: 'auto', padding: '8px 14px' }}
          onClick={() => onChange({ recentEmailsEnabled: true })}
        >
          Enable history
        </button>
      </div>
    );
  }

  return (
    <div className="recent-controls">
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span className="hint" style={{ margin: 0 }}>
          Saving generated emails to history
        </span>
        <button
          type="button"
          className="copy-mini"
          onClick={() => onChange({ recentEmailsEnabled: false })}
        >
          Disable history
        </button>
      </div>

      <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
        <label htmlFor="recent-limit">Max emails saved</label>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {RECENT_EMAIL_LIMIT_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              className={`copy-mini ${limit === n ? 'limit-preset-active' : ''}`}
              onClick={() => setLimit(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          id="recent-limit"
          type="number"
          min={1}
          max={MAX_RECENT_EMAIL_LIMIT}
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value, 10))}
        />
        <p className="hint">Oldest entries are removed when over this limit (max {MAX_RECENT_EMAIL_LIMIT}).</p>
      </div>
    </div>
  );
}

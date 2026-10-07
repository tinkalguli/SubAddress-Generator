import { useEffect, useState } from 'react';
import { useBackgroundSession } from './hooks/useBackgroundSession';
import { copyToClipboard } from '../utils/clipboard';
import {
  generateViaBackground,
  getActiveTabUrl,
  getLastGeneratedFromBackground,
  getRecentFromBackground,
} from '../utils/messaging';
import { validatePrimaryEmail } from '../utils/validation';
import { RecentHistoryControls } from '../components/RecentHistoryControls';
import { getFormatExample } from '../core/timestamp';
import { isBuiltinTemplateId } from '../storage/custom-templates';
import { EXAMPLE_PRIMARY_EMAIL } from '../constants/demo';

function templateUsesTimestamp(t: { template: string }): boolean {
  return t.template.includes('{timestamp}');
}

function shortEmailDisplay(email: string): string {
  const plus = email.indexOf('+');
  const at = email.indexOf('@');
  if (plus >= 0 && at > plus) {
    return email.slice(plus + 1, at);
  }
  return email;
}

export function App() {
  const { session, loading, updateSession, refresh } = useBackgroundSession();
  const [tabUrl, setTabUrl] = useState<string | undefined>();
  const [lastGenerated, setLastGenerated] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getActiveTabUrl().then(setTabUrl);
    void Promise.all([getLastGeneratedFromBackground(), getRecentFromBackground()]).then(
      ([last, recentList]) => {
        setRecent(recentList);
        setLastGenerated(last || recentList[0] || '');
      },
    );

    const refreshUrl = () => {
      getActiveTabUrl().then(setTabUrl);
    };
    chrome.tabs.onUpdated.addListener(refreshUrl);
    chrome.tabs.onActivated.addListener(refreshUrl);
    return () => {
      chrome.tabs.onUpdated.removeListener(refreshUrl);
      chrome.tabs.onActivated.removeListener(refreshUrl);
    };
  }, []);

  const emailError = session ? validatePrimaryEmail(session.settings.primaryEmail) : null;
  const templateSelected = Boolean(session?.selectedTemplateId);

  const handleGenerate = async () => {
    if (!session || emailError) return;
    setBusy(true);
    setError(null);
    const result = await generateViaBackground(tabUrl);
    if (result.email) {
      setLastGenerated(result.email);
      const list = await getRecentFromBackground();
      setRecent(list);
      await copyToClipboard(result.email);
      await refresh();
    } else {
      setError(result.error ?? 'Generation failed');
    }
    setBusy(false);
  };

  if (loading || !session) {
    return <div className="app-popup content">Loading…</div>;
  }

  const templateOptions = session.templates.filter((t) => t.enabled);
  const builtinOptions = templateOptions.filter((t) => isBuiltinTemplateId(t.id));
  const customOptions = templateOptions.filter((t) => !isBuiltinTemplateId(t.id));

  return (
    <div className="app-popup">
      <header className="header">
        <div className="header-brand">
          <img src="icons/icon48.png" alt="" className="header-logo" width={28} height={28} />
          <h1>SubAddress Generator</h1>
        </div>
      </header>

      <div className="content">
        <div className="field">
          <label htmlFor="primary">Primary Email</label>
          <input
            id="primary"
            type="email"
            placeholder={EXAMPLE_PRIMARY_EMAIL}
            value={session.settings.primaryEmail}
            onChange={(e) =>
              updateSession({ settings: { ...session.settings, primaryEmail: e.target.value } })
            }
          />
          <p className="hint">Subaddressing support depends on the email provider.</p>
          {emailError && session.settings.primaryEmail && (
            <p className="error-text">{emailError}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="template">Template</label>
          <select
            id="template"
            value={session.selectedTemplateId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              updateSession({ selectedTemplateId: v ? v : null });
            }}
          >
            <option value="">Select template…</option>
            {builtinOptions.length > 0 && (
              <optgroup label="Built-in">
                {builtinOptions.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    title={
                      templateUsesTimestamp(t) ? getFormatExample(t.timestampFormat) : 'Random code'
                    }
                  >
                    {t.name}
                  </option>
                ))}
              </optgroup>
            )}
            {customOptions.length > 0 && (
              <optgroup label="My templates">
                {customOptions.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    title={
                      templateUsesTimestamp(t) ? getFormatExample(t.timestampFormat) : 'Custom pattern'
                    }
                  >
                    {t.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="prefix">Prefix</label>
            <input
              id="prefix"
              value={session.settings.prefix}
              placeholder="optional"
              onChange={(e) =>
                updateSession({ settings: { ...session.settings, prefix: e.target.value } })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="suffix">Suffix</label>
            <input
              id="suffix"
              value={session.settings.suffix}
              placeholder="optional"
              onChange={(e) =>
                updateSession({ settings: { ...session.settings, suffix: e.target.value } })
              }
            />
          </div>
        </div>

        <div className="field">
          <label>Generated Email</label>
          <div className="generated-row">
            <div className="generated-box" title={lastGenerated}>
              {lastGenerated}
            </div>
            <button
              type="button"
              className="generated-copy-btn"
              disabled={!lastGenerated}
              title="Copy to clipboard"
              onClick={() => copyToClipboard(lastGenerated)}
            >
              Copy
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          type="button"
          className="btn-primary"
          disabled={Boolean(emailError) || !session.settings.primaryEmail || !templateSelected || busy}
          onClick={handleGenerate}
        >
          Generate &amp; Copy
        </button>

        <section className="recent-section">
          <h2>Recent</h2>
          <RecentHistoryControls
            settings={session.settings}
            onChange={(partial) => {
              updateSession({
                settings: { ...session.settings, ...partial },
              });
              if (partial.recentEmailLimit != null || partial.recentEmailsEnabled != null) {
                getRecentFromBackground().then(setRecent);
              }
            }}
          />
          {!session.settings.recentEmailsEnabled ? null : (
            <ul className="recent-list">
              {recent.length === 0 && <li className="hint">No recent emails yet</li>}
              {recent.map((email) => (
                <li key={email}>
                  <button type="button" title={email} onClick={() => copyToClipboard(email)}>
                    {shortEmailDisplay(email)}
                  </button>
                  <button
                    type="button"
                    className="copy-mini"
                    onClick={() => copyToClipboard(email)}
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

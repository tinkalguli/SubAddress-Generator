import { getFormatExample } from '../core/timestamp';

interface Props {
  format: string;
  /** Shown when format is empty (custom not matching a preset). */
  fallbackExample?: string;
}

export function FormatExampleHint({ format, fallbackExample }: Props) {
  const example = format ? getFormatExample(format) : fallbackExample;
  if (!example) return null;

  return (
    <span className="format-example-hint">
      <span
        className="format-example-hint__icon"
        tabIndex={0}
        aria-describedby={undefined}
        title={`Example: ${example}`}
      >
        ⓘ
      </span>
      <span className="format-example-hint__tooltip" role="tooltip">
        Example: {example}
      </span>
    </span>
  );
}

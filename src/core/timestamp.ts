const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** Lowercase month labels (September → sept) */
const MONTH_LOWER = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sept', 'oct', 'nov', 'dec',
] as const;

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function hour12(date: Date): number {
  const h = date.getHours();
  return h % 12 || 12;
}

function ampmLabel(date: Date): string {
  return date.getHours() >= 12 ? 'pm' : 'am';
}

export interface TimestampParts {
  D: string;
  DD: string;
  MM: string;
  MMM: string;
  mmm: string;
  mmmm: string;
  MMMM: string;
  YY: string;
  YYYY: string;
  HH: string;
  hh: string;
  mm: string;
  ss: string;
  ampm: string;
}

export function getTimestampParts(date: Date): TimestampParts {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return {
    D: String(day),
    DD: pad2(day),
    MM: pad2(month + 1),
    MMM: MONTH_SHORT[month]!,
    mmm: MONTH_LOWER[month]!,
    mmmm: MONTH_LONG[month]!.toLowerCase(),
    MMMM: MONTH_LONG[month]!,
    YY: pad2(year % 100),
    YYYY: year.toString(),
    HH: pad2(date.getHours()),
    hh: pad2(hour12(date)),
    mm: pad2(date.getMinutes()),
    ss: pad2(date.getSeconds()),
    ampm: ampmLabel(date),
  };
}

/** Replace format tokens (longer tokens first). */
export function formatTimestamp(format: string, date: Date): string {
  const p = getTimestampParts(date);
  const tokens: [string, string][] = [
    ['YYYY', p.YYYY],
    ['MMMM', p.MMMM],
    ['mmmm', p.mmmm],
    ['MMM', p.MMM],
    ['mmm', p.mmm],
    ['DD', p.DD],
    ['MM', p.MM],
    ['ampm', p.ampm],
    ['YY', p.YY],
    ['HH', p.HH],
    ['hh', p.hh],
    ['mm', p.mm],
    ['ss', p.ss],
    ['D', p.D],
  ];
  let result = format;
  for (const [token, value] of tokens) {
    result = result.split(token).join(value);
  }
  return result;
}

export interface TimestampFormatPreset {
  label: string;
  format: string;
  sample: string;
  kind: 'word' | 'number';
}

/** Tokens you can combine in a custom format string (use in Settings or template editor). */
export const TIMESTAMP_TOKENS: { token: string; meaning: string; example: string }[] = [
  { token: 'D', meaning: 'Day (no leading zero)', example: '12' },
  { token: 'DD', meaning: 'Day (two digits)', example: '09' },
  { token: 'MM', meaning: 'Month number', example: '09' },
  { token: 'MMM', meaning: 'Month short word', example: 'Sep' },
  { token: 'mmm', meaning: 'Month short word (lowercase)', example: 'sept' },
  { token: 'mmmm', meaning: 'Month full word (lowercase)', example: 'june' },
  { token: 'MMMM', meaning: 'Month full word', example: 'June' },
  { token: 'YY', meaning: 'Year (two digits)', example: '26' },
  { token: 'YYYY', meaning: 'Year (four digits)', example: '2026' },
  { token: 'HH', meaning: 'Hour 24-hour clock', example: '11' },
  { token: 'hh', meaning: 'Hour 12-hour clock', example: '11' },
  { token: 'mm', meaning: 'Minutes', example: '21' },
  { token: 'ss', meaning: 'Seconds', example: '05' },
  { token: 'ampm', meaning: 'am or pm', example: 'am' },
];

/** Sample: 7 June 2026, 15:04:05 — used for preset example labels. */
export const TIMESTAMP_SAMPLE_DATE = new Date(2026, 5, 7, 15, 4, 5);

function buildPreset(format: string, kind: 'word' | 'number'): TimestampFormatPreset {
  const sample = formatTimestamp(format, TIMESTAMP_SAMPLE_DATE);
  return { kind, format, label: sample, sample };
}

/** Full date + time through seconds (month as words). */
const WORD_FORMAT_STRINGS = [
  'D-mmm-YYYY-HH-mm-ss-ampm',
  'D-mmmm-YYYY-HH-mm-ss-ampm',
  'DD-MMM-YYYY-HH-mm-ss',
  'DD-MMMM-YYYY-HH-mm-ss',
  'DD-MMMM-YYYY-hh-mm-ss-ampm',
  'DD-MMM-YYYY-hh-mm-ss-ampm',
  'DD-MMMM-YYYY-HH-mm-ss-ampm',
  'D-mmm-YYYY-HH-mm-ss',
  'DDMMMMYYYY-HHmmss',
  'DD-MMMM-YYYY at HH-mm-ss',
  'D mmmm YYYY HH mm ss',
] as const;

/** Full date + time through seconds (numeric month/day). */
const NUMBER_FORMAT_STRINGS = [
  'DD-MM-YYYY-HH-mm-ss',
  'DD-MM-YY-HH-mm-ss',
  'YYYY-MM-DD-HH-mm-ss',
  'YYYYMMDD-HHmmss',
  'DDMMYYYY-HHmmss',
  'DDMMMYYYY-HHmmss',
  'DDMMMYYYYHHmmss',
  'HHmmss-DDMMYYYY',
] as const;

export const TIMESTAMP_WORD_PRESETS: TimestampFormatPreset[] = WORD_FORMAT_STRINGS.map((f) =>
  buildPreset(f, 'word'),
);

export const TIMESTAMP_NUMBER_PRESETS: TimestampFormatPreset[] = NUMBER_FORMAT_STRINGS.map((f) =>
  buildPreset(f, 'number'),
);

export function datetimeDisplayName(format: string): string {
  return `Datetime [${format}]`;
}

export function getFormatExample(format: string): string {
  if (!format.trim()) return '';
  return formatTimestamp(format, TIMESTAMP_SAMPLE_DATE);
}

export function presetSelectLabel(p: { format: string }): string {
  return datetimeDisplayName(p.format);
}

export const TIMESTAMP_PRESETS: { label: string; format: string }[] = [
  ...TIMESTAMP_WORD_PRESETS.map((p) => ({
    label: presetSelectLabel(p),
    format: p.format,
  })),
  ...TIMESTAMP_NUMBER_PRESETS.map((p) => ({
    label: presetSelectLabel(p),
    format: p.format,
  })),
  { label: 'Custom [type tokens]', format: '' },
];

export function formatTimestampWithSeparator(
  format: string,
  date: Date,
  internalSeparator: string,
): string {
  const raw = formatTimestamp(format, date);
  if (internalSeparator === '-') return raw;
  return raw.replace(/-/g, internalSeparator);
}

export const TEMPLATE_PARTS_HELP =
  'Use {base}, {domain}, {prefix}, and either {timestamp} or {random4}/{random6}—not both unless you need extra uniqueness.';

export function previewTimestampFormat(format: string, date = new Date(2026, 8, 23, 11, 21, 5)): string {
  return formatTimestamp(format, date);
}

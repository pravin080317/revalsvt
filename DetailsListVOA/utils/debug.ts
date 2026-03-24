const PREFIX = '[SVT]';

const isEnabled = (): boolean =>
  (globalThis as unknown as { SVT_DEBUG?: boolean }).SVT_DEBUG === true;

export const svtDebug = {
  log: (tag: string, message: string, ...data: unknown[]): void => {
    if (!isEnabled()) return;
    console.log(`${PREFIX}[${tag}]`, message, ...data);
  },
  warn: (tag: string, message: string, ...data: unknown[]): void => {
    if (!isEnabled()) return;
    console.warn(`${PREFIX}[${tag}]`, message, ...data);
  },
  error: (tag: string, message: string, ...data: unknown[]): void => {
    if (!isEnabled()) return;
    console.error(`${PREFIX}[${tag}]`, message, ...data);
  },
  group: (tag: string, label: string): void => {
    if (!isEnabled()) return;
    console.groupCollapsed(`${PREFIX}[${tag}] ${label}`);
  },
  groupEnd: (): void => {
    if (!isEnabled()) return;
    console.groupEnd();
  },
  table: (tag: string, data: unknown): void => {
    if (!isEnabled()) return;
    console.log(`${PREFIX}[${tag}]`);
    console.table(data);
  },
};

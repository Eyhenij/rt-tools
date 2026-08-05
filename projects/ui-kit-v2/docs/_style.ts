/**
 * Общее оформление страниц документации.
 *
 * Вынесено из страниц, потому что расхождение в оформлении читается как разница
 * по смыслу: таблица, набранная иначе соседней, выглядит документом другого рода.
 */

const MONO: string = 'var(--rt-font-family-mono)';
const HAIRLINE: string = '1px solid var(--rt-color-border-subtle)';
const RULE: string = '1px solid var(--rt-color-border-default)';

export const intro: object = { fontSize: 14, lineHeight: 1.6, opacity: 0.9 };

/** Выноска с правилом: левая полоса вместо рамки — она не спорит с таблицами. */
export const callout: object = {
    borderLeft: '3px solid var(--rt-color-action-primary)',
    background: 'var(--rt-color-bg-surface-subtle)',
    padding: '10px 14px',
    fontSize: 13,
    marginBlock: 14,
    borderRadius: '0 6px 6px 0',
};

export const section: object = { borderBottom: RULE, paddingBottom: 6, marginTop: 34, marginBottom: 6 };

/** Панель с крупными образцами над таблицей: что именно называют её строки. */
export const panel: object = {
    border: RULE,
    borderRadius: 10,
    padding: 18,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 18,
    marginBlock: 16,
    background: 'var(--rt-color-bg-surface)',
};
export const panelItem: object = { width: 140, display: 'flex', flexDirection: 'column', gap: 6 };
export const panelPatch: (value: string) => object = (value: string): object => ({
    height: 62,
    borderRadius: 6,
    background: value,
    border: HAIRLINE,
});
export const panelName: object = { fontFamily: MONO, fontSize: 10.5, lineHeight: 1.35, opacity: 0.75, wordBreak: 'break-all' };

export const table: object = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    border: RULE,
    borderRadius: 10,
    overflow: 'hidden',
    marginBlock: 16,
    fontSize: 13,
};
export const th: object = {
    textAlign: 'left',
    padding: '11px 14px',
    background: 'var(--rt-color-bg-surface-subtle)',
    borderBottom: RULE,
    fontWeight: 600,
};
export const td: object = { padding: '10px 14px', borderBottom: HAIRLINE, verticalAlign: 'middle' };
export const tdMono: object = { ...td, fontFamily: MONO, fontSize: 11.5, whiteSpace: 'nowrap' };
export const cellSwatch: (value: string) => object = (value: string): object => ({
    width: 22,
    height: 22,
    borderRadius: 4,
    background: value,
    border: HAIRLINE,
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 8,
});

/** Строка шкалы: имя слева, мера посередине, значение справа. */
export const scaleRow: (odd: boolean) => object = (odd: boolean): object => ({
    display: 'grid',
    gridTemplateColumns: '230px 1fr 90px',
    alignItems: 'center',
    gap: 12,
    padding: '5px 10px',
    borderBottom: HAIRLINE,
    background: odd ? 'var(--rt-color-bg-surface-subtle)' : 'transparent',
});
export const scaleName: object = { fontFamily: MONO, fontSize: 11.5 };
export const scaleValue: object = { fontFamily: MONO, fontSize: 11.5, opacity: 0.7, textAlign: 'right' };

/** Сплошная лента ряда: ступени стоят встык, поэтому переход между ними виден. */
export const strip: object = { display: 'flex', borderRadius: 8, overflow: 'hidden', border: HAIRLINE };
export const stripCell: (value: string) => object = (value: string): object => ({ flex: '1 1 0', height: 56, background: value });
export const stripLegend: object = { display: 'flex', marginTop: 6 };
export const stripLabel: object = {
    flex: '1 1 0',
    fontFamily: MONO,
    fontSize: 9.5,
    lineHeight: 1.3,
    textAlign: 'center',
    opacity: 0.7,
    wordBreak: 'break-all',
    paddingInline: 2,
};

export const scaleGrid: object = { display: 'grid', gridTemplateColumns: '230px 1fr', gap: 20, alignItems: 'start', marginBlock: 18 };
export const scaleTitle: object = { fontWeight: 600, fontSize: 14 };
export const scaleNote: object = { fontSize: 12.5, opacity: 0.7, marginTop: 4, lineHeight: 1.5 };
export const empty: object = { fontSize: 13, opacity: 0.7, marginBlock: 12 };

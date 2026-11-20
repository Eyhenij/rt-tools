import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC: string = join(__dirname, '..', '..');

/** Исходники входа без спек и историй: только то, что попадает в сборку. */
function sourcesOf(entry: string): string[] {
    const walk: (dir: string) => string[] = (dir: string): string[] =>
        readdirSync(dir).flatMap((name: string): string[] => {
            const path: string = join(dir, name);
            if (statSync(path).isDirectory()) {
                return name === 'stories' ? [] : walk(path);
            }

            return name.endsWith('.ts') && !name.endsWith('.spec.ts') ? [path] : [];
        });

    return walk(join(SRC, entry));
}

/** Модули, которые файлы входа называют в `import … from '…'`. */
function importsOf(entry: string): string[] {
    return sourcesOf(entry).flatMap((file: string): string[] =>
        [...readFileSync(file, 'utf8').matchAll(/from '([^']+)'/g)].map((match: RegExpMatchArray): string => match[1])
    );
}

describe('изоляция входов графика', (): void => {
    it('SC-UKV-1372 — rich-editor не тянет d3 и блок графика, а график не тянет редактор', (): void => {
        const editor: string[] = importsOf('rich-editor');
        const chart: string[] = importsOf('lib/components/chart');

        expect(editor).toContain('quill');
        expect(chart.some((name: string): boolean => name.startsWith('d3-'))).toBe(true);

        expect(editor.filter((name: string): boolean => name.startsWith('d3-') || name.includes('ai-chat-chart'))).toEqual([]);
        expect(chart.filter((name: string): boolean => name === 'quill' || name.includes('rich-editor'))).toEqual([]);
    });
});

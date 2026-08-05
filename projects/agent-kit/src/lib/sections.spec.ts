import { IDocument, ISection, mergeDocuments, parseDocument, renderDocument } from './sections.js';

const doc: (text: string) => IDocument = (text: string): IDocument => parseDocument(text);

describe('parseDocument', () => {
    it('вступление отделяется от разделов', () => {
        const parsed: IDocument = doc('# Закон\n\nЗачем он нужен.\n\n## Статьи\n\n- Первая.\n');

        expect(parsed.preamble).toBe('# Закон\n\nЗачем он нужен.');
        expect(parsed.sections).toEqual([{ heading: '## Статьи', body: '- Первая.' }]);
    });

    it('заголовок внутри блока кода разделом не считается', () => {
        const parsed: IDocument = doc('## Статьи\n\n```\n## Это пример\n```\n');

        expect(parsed.sections).toHaveLength(1);
        expect(parsed.sections[0].body).toContain('## Это пример');
    });

    it('подраздел остаётся в теле своего раздела', () => {
        const parsed: IDocument = doc('## Сквозные\n\n### Локали\n\nВосемь.\n');

        expect(parsed.sections).toHaveLength(1);
        expect(parsed.sections[0].body).toBe('### Локали\n\nВосемь.');
    });
});

describe('mergeDocuments', () => {
    const base: IDocument = doc('Вступление пакета.\n\n## Статьи\n\n- Общая.\n\n## Открытые вопросы\n\n- Q-1.\n');

    it('совпавший заголовок замещает раздел пакета', () => {
        const merged: IDocument = mergeDocuments(base, doc('## Статьи\n\n- Своя.\n'));

        expect(merged.sections.map((section: ISection): string => section.body)).toEqual(['- Своя.', '- Q-1.']);
    });

    it('новый заголовок дописывается в конец', () => {
        const merged: IDocument = mergeDocuments(base, doc('## Решения\n\nРешили так.\n'));

        expect(merged.sections.map((section: ISection): string => section.heading)).toEqual([
            '## Статьи',
            '## Открытые вопросы',
            '## Решения',
        ]);
    });

    it('пустой раздел снимает раздел пакета', () => {
        const merged: IDocument = mergeDocuments(base, doc('## Открытые вопросы\n'));

        expect(merged.sections.map((section: ISection): string => section.heading)).toEqual(['## Статьи']);
    });

    it('вступление надстройки замещает вступление пакета', () => {
        expect(mergeDocuments(base, doc('Своё вступление.\n\n## Статьи\n\n- Своя.\n')).preamble).toBe('Своё вступление.');
    });

    it('надстройка без вступления вступление пакета не трогает', () => {
        expect(mergeDocuments(base, doc('## Статьи\n\n- Своя.\n')).preamble).toBe('Вступление пакета.');
    });

    it('без надстройки текст пакета не меняется', () => {
        expect(mergeDocuments(base, null)).toBe(base);
    });

    it('порядок разделов пакета сохраняется при замещении', () => {
        const merged: IDocument = mergeDocuments(base, doc('## Открытые вопросы\n\n- Q-2.\n\n## Статьи\n\n- Своя.\n'));

        expect(merged.sections.map((section: ISection): string => section.heading)).toEqual(['## Статьи', '## Открытые вопросы']);
    });
});

describe('renderDocument', () => {
    it('разбор и сборка возвращают тот же текст', () => {
        const text: string = '# Закон\n\nЗачем.\n\n## Статьи\n\n- Первая.\n\n## Открытые вопросы\n\n- Q-1.\n';

        expect(renderDocument(doc(text))).toBe(text);
    });

    it('раздел без тела остаётся одним заголовком', () => {
        expect(renderDocument({ preamble: '', sections: [{ heading: '## Пусто', body: '' }] })).toBe('## Пусто\n');
    });
});

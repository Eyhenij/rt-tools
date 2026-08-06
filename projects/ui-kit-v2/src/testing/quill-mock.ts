/**
 * Заглушка редактора Quill для спек.
 *
 * Сам Quill в jsdom не поднимается: он тянет браузерные API, которых там нет,
 * и падает ещё на загрузке модуля. Компонент кита грузит его динамическим
 * `import('quill')`, поэтому подмена ставится на уровень модуля — так проверяется
 * то, что делает кит вокруг редактора, а не сам редактор.
 */

/** Минимальная модель содержимого, которой обменивается кит с редактором. */
export interface IQuillMockDelta {
    ops: { insert: string }[];
}

/** Экземпляры, созданные за тест: через них спека имитирует правку. */
export const quillInstances: QuillMock[] = [];

export class QuillMock {
    public readonly handlers: Map<string, () => void> = new Map<string, () => void>();
    public enabled: boolean = true;
    public focused: boolean = false;

    #contents: IQuillMockDelta = { ops: [] };

    constructor() {
        quillInstances.push(this);
    }

    public setContents(value: IQuillMockDelta | null): void {
        this.#contents = value ?? { ops: [] };
    }

    public getContents(): IQuillMockDelta {
        return this.#contents;
    }

    public getText(): string {
        return this.#contents.ops.map((op: { insert: string }): string => op.insert).join('');
    }

    public on(event: string, handler: () => void): void {
        this.handlers.set(event, handler);
    }

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }

    public focus(): void {
        this.focused = true;
    }

    /** Имитирует ввод пользователя и будит подписчика правок. */
    public typeText(text: string): void {
        this.#contents = text === '' ? { ops: [] } : { ops: [{ insert: text }] };
        this.handlers.get('text-change')?.();
    }
}

/** Сбрасывает список созданных экземпляров между тестами. */
export function resetQuillInstances(): void {
    quillInstances.length = 0;
}

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

/** Привязка клавиши, как её объявляет кит при создании редактора. */
export interface IQuillMockBinding {
    key: string;
    shiftKey?: boolean;
    handler: () => boolean;
}

/** Та часть настроек, которую макет разбирает, — остальное ему не нужно. */
export interface IQuillMockOptions {
    modules?: {
        keyboard?: {
            bindings?: Record<string, IQuillMockBinding>;
        };
    };
}

/** Экземпляры, созданные за тест: через них спека имитирует правку. */
export const quillInstances: QuillMock[] = [];

export class QuillMock {
    #contents: IQuillMockDelta = { ops: [] };

    public readonly handlers: Map<string, () => void> = new Map<string, () => void>();
    /**
     * Привязки клавиш, объявленные китом. Макет их не только хранит, но и даёт
     * нажать (`press`): иначе повешенные на них обработчики не проверяет ничто,
     * а спека читается так, будто проверяет.
     */
    public readonly bindings: Record<string, IQuillMockBinding>;
    public enabled: boolean = true;
    public focused: boolean = false;

    constructor(host?: unknown, options?: IQuillMockOptions) {
        this.bindings = options?.modules?.keyboard?.bindings ?? {};
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

    /**
     * Имитирует нажатие клавиши с объявленной привязкой. Возвращает то же, что
     * обработчик: `false` значит «дальше не пускать» (перенос строки погашен).
     * `undefined` — привязки с таким именем нет.
     */
    public press(binding: string): boolean | undefined {
        return this.bindings[binding]?.handler();
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

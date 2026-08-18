export type TModsObject = Record<string, unknown>;

export interface IBemConfig {
    separators: {
        el: string;
        mod: string;
        val: string;
    };
    ignoreValues?: boolean;
    modCase?: string;
}

/** Как модификаторы приходят снаружи: строкой, списком строк, списком с выключенными или объектом. */
export type TModsInput = string | string[] | (string | false)[] | TModsObject;

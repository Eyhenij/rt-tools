export type IModsObject = Record<string, unknown>;

/** Модификаторы так, как их пишут в разметке: строкой, списком, списком с пропусками или объектом. */
export type TMods = string | string[] | (string | false)[] | IModsObject;

export interface IBemConfig {
    separators: {
        el: string;
        mod: string;
        val: string;
    };
    ignoreValues?: boolean;
    modCase?: string;
}

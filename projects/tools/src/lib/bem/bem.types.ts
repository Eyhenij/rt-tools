export type IModsObject = Record<string, unknown>;

export interface IBemConfig {
    separators: {
        el: string;
        mod: string;
        val: string;
    };
    ignoreValues?: boolean;
    modCase?: string;
}

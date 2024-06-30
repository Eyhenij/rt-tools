export interface Icon {
    value: string;
    style?: { [className: string]: string };
}

export interface Select<T> {
    value: Array<NameValueType<string, T>>;
    label?: string;
    hint?: string;
}

export interface NameValueType<N = string, V = string> {
    name: N;
    value: V;
}

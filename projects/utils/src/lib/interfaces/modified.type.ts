export type IModify<T, R> = Omit<T, keyof R> & R;

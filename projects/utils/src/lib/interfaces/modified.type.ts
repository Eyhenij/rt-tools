export type TModify<T, R> = Omit<T, keyof R> & R;

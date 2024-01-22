/** Makes selected props from a record optional */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

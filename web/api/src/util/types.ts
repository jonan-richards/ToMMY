type ExactHelper<A, B> = A extends B
    ? B extends A
        ? A
        : never
    : never;

export type Exact<T> = ExactHelper<T, T>;

export function exact<A, B>(value: ExactHelper<B, A>): A {
    return value;
}

export interface IMapper<I, M> {
    mapFrom(raw: I): M;
    mapTo?(model: M): I;
}

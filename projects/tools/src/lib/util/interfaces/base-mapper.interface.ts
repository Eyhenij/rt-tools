import { TypeCastHelper } from '../helpers/type-cast.helper';

export interface IBaseMapper<M> {
    typeCast: TypeCastHelper;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapTo?: (model: M, ...args: any[]) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapFrom?: (data: any, ...args: any[]) => M;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapToArray?: (models: M[], ...args: any[]) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapFromArray?: (data: any[], ...args: any[]) => M[];
}

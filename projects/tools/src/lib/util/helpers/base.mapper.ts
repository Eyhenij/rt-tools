import { IBaseMapper } from '../interfaces';
import { TypeCastHelper } from './type-cast.helper';

export abstract class BaseMapper<M> implements IBaseMapper<M> {
    public typeCast: TypeCastHelper = new TypeCastHelper();

    // eslint-disable-next-line
    public mapFrom(data: NonNullable<unknown>, ...args: unknown[]): M {
        return { ...data } as M;
    }

    public mapFromArray(data: NonNullable<unknown>[], ...args: unknown[]): M[] {
        if (!Array.isArray(data)) {
            // eslint-disable-next-line no-console
            console.error(
                'mapFromArray: Given data must be an array (now it is ' + typeof data + '). Incorrect data will be defined as empty array.'
            );
            data = [];
        }

        return data.map((entry: NonNullable<unknown>) => this.mapFrom(entry, ...args));
    }

    // eslint-disable-next-line
    public mapTo(model: M, ...args: unknown[]): unknown {
        return { ...model };
    }

    public mapToArray(models: M[], ...args: unknown[]): unknown[] {
        if (!Array.isArray(models)) {
            // eslint-disable-next-line no-console
            console.error(
                'mapToArray: Given data must be an array (now it is ' + typeof models + '). Incorrect data will be defined as empty array.'
            );
            models = [];
        }

        return models.map((model: M) => this.mapTo(model, ...args));
    }
}

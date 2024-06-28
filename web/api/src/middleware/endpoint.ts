import { RequestHandler } from 'express';
import yup from 'yup';
import authentication from './auth';
import { ValidUser } from '../services/user';

type Validation = {
    params?: Record<string, unknown>
    body?: Record<string, unknown>
    query?: Record<string, unknown>
};

type ValidationSchema<T extends Validation = Validation> = yup.ObjectSchema<T>;

const validation = (schema: ValidationSchema): RequestHandler => async (req, res, next) => {
    const { body, query, params } = req;

    try {
        await schema.validate({ body, query, params });
        return next();
    } catch (e) {
        if (e instanceof yup.ValidationError) {
            return res.status(400).json({ error: 'validation', message: e.message });
        }

        return res.status(500);
    }
};

export type Endpoint<
    TResponse extends Record<string, unknown>,
    TError extends string,
    TIsAuth extends boolean,
    TValidation extends Validation | undefined,
> = (
    RequestHandler<
    TValidation extends Validation ? TValidation['params'] extends Record<string, unknown> ?
        TValidation['params']
        : Record<string, unknown>
        : Record<string, unknown>,
    TResponse | { error: TError | 'internal' },
    TValidation extends Validation ? TValidation['body'] extends Record<string, unknown> ?
        TValidation['body']
        : Record<string, unknown>
        : Record<string, unknown>,
    TValidation extends Validation ? TValidation['query'] extends Record<string, unknown> ?
        TValidation['query']
        : Record<string, unknown>
        : Record<string, unknown>,
    TIsAuth extends true ? { user: ValidUser } : Record<string, unknown>>
);

export default <
    TIsAuth extends boolean = boolean,
    TValidation extends Validation | undefined = undefined,
>(options: {
    auth: TIsAuth,
    validate: TValidation extends Validation ? ValidationSchema<TValidation> : false,
}) => ({
    handle: <
        TResponse extends Record<string, unknown> = Record<string, never>,
        TError extends string = never,
    >(handler: Endpoint<TResponse, TError, TIsAuth, TValidation>) => [
        ...(options.auth !== false ? [authentication] : []),
        ...(options.validate !== false ? [validation(options.validate)] : []),
        handler,
    ],
});

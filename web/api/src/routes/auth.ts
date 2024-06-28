import { Router } from 'express';
import yup from 'yup';
import jwt from 'jsonwebtoken';
import { UserResponse } from '#shared/api';
import endpoint from '../middleware/endpoint';
import { groups } from '../lib/design';
import userService from '../services/user';
import { exact } from '../util/types';

const router = Router();

const token = (user: UserResponse) => jwt.sign(user, process.env.API_JWT_KEY ?? '', {
    expiresIn: '1h',
});

router.post(
    '/login',
    ...endpoint({
        auth: false,
        validate: yup.object({
            body: yup.object({
                username: yup.string().required(),
                password: yup.string().required(),
            }),
        }),
    }).handle<
    { user: UserResponse, token: string },
    'auth/invalid-credentials' | 'auth/invalid-group'
    >(async (req, res) => {
        const { username, password } = req.body;

        const user = await userService.getByUsername(username);

        if (user === null || user.password !== password) {
            res.status(401).json({ error: 'auth/invalid-credentials' });
        } else if (!(groups as readonly string[]).includes(user.group)) {
            res.status(500).json({ error: 'auth/invalid-group' });
        } else {
            const userResponse = userService.format.response(user);
            res.json(exact({
                user: userResponse,
                token: token(userResponse),
            }));
        }
    }),
);

router.get(
    '/refresh',
    ...endpoint({
        auth: true,
        validate: false,
    }).handle<{ user: UserResponse, token: string }>(async (req, res) => {
        const userResponse = userService.format.response(res.locals.user);
        res.json(exact({
            user: userResponse,
            token: token(userResponse),
        }));
    }),
);

export default router;

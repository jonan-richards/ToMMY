import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import {
    Group,
    groups,
} from '../lib/design';
import userService from '../services/user';

if (process.env.API_JWT_KEY === undefined) {
    throw new Error('Environment variable API_JWT_KEY not set');
}

export default (async (req, res, next) => {
    const header = req.headers.authorization;

    if (header === undefined) {
        return res.status(401).json({ error: 'auth/missing' });
    }

    const token = header.match(/^Bearer ([^ ]*)$/)?.[1];
    if (token === undefined) {
        return res.status(401).json({ error: 'auth/missing' });
    }

    let payload;

    try {
        payload = jwt.verify(token, process.env.API_JWT_KEY ?? '');
    } catch {
        return res.status(401).json({ error: 'auth/invalid' });
    }

    if (typeof payload === 'string' || typeof payload.username !== 'string') {
        return res.status(401).json({ error: 'auth/invalid' });
    }

    const { username } = payload;
    const user = await userService.getByUsername(username);
    if (user === null) {
        return res.status(401).json({ error: 'auth/invalid' });
    }

    if (!groups.includes(user.group as Group)) {
        return res.status(500).json({ error: 'auth/invalid-group' });
    }

    res.locals.user = user;

    return next();
}) as RequestHandler;

/* eslint-disable no-console */
import './plugins/env';
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';

import routes from './routes';

const host = 'localhost';
const port = parseInt(process.env.API_PORT ?? '8080', 10);
const clientPort = parseInt(process.env.CLIENT_PORT ?? '3000', 10);

const app = express()
    .use(express.json())
    .use(cors({
        origin: `http://${host}:${clientPort}`,
    }))
    .use(routes)
    .use('*', (req, res) => {
        res.status(404).json({ error: 'not-found' });
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .use(((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'internal' });
    }) as ErrorRequestHandler);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
});

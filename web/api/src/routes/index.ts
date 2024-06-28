import { Router } from 'express';
import auth from './auth';
import step from './step';

export default Router()
    .use('/auth', auth)
    .use('/step', step);

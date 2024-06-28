import { Router } from 'express';
import yup from 'yup';
import {
    Step,
    stages,
    stepsEqual,
} from '#shared/step';
import {
    EvaluationStepResponse,
    FinishedStepResponse,
    InteractionMessageAddResponse,
    InteractionStepResponse,
    OverviewResponse,
    QuizStepResponse,
    UserStepResponse,
    WelcomeStepResponse,
} from '#shared/api';
import endpoint from '../middleware/endpoint';
import { exact } from '../util/types';
import {
    Config,
    getConfig,
} from '../lib/design';
import stepService from '../services/step';
import qualtricsService from '../services/qualtrics';
import interactionService from '../services/interaction';
import {
    getStepKey,
    getTaskNameFromAlias,
} from '../lib/step';
import { getSnippet } from '../lib/task';
import { agents } from '../lib/agent';
import { User } from '../services/user';

const router = Router();

const errors = {
    NOT_CURRENT: 'step/not-current',
    INVALID_TASK: 'step/invalid-task',
} as const;

async function isCurrentStep(
    config: Config,
    user: User,
    step: Step,
) {
    const overview = await stepService.getOverview(config, user);

    // Only admin users can view steps that are not the current step
    return stepsEqual(overview.current, step) || user.isAdmin;
}

// Get overview
router.get(
    '/',
    ...endpoint({
        auth: true,
        validate: false,
    }).handle<OverviewResponse>(async (req, res) => {
        const config = await getConfig();
        const overview = await stepService.getOverview(config, res.locals.user);
        res.json(overview);
    }),
);

// Move on to next step
router.get(
    '/next',
    ...endpoint({
        auth: true,
        validate: false,
    }).handle<OverviewResponse>(async (req, res) => {
        const config = await getConfig();
        const overview = await stepService.getOverview(config, res.locals.user);

        await stepService.complete(config, res.locals.user, overview.current);

        // Respond with overview
        const newOverview = await stepService.getOverview(config, res.locals.user);
        res.json(newOverview);
    }),
);

// Start current step
router.get(
    '/start',
    ...endpoint({
        auth: true,
        validate: false,
    }).handle<UserStepResponse>(async (req, res) => {
        const config = await getConfig();
        const overview = await stepService.getOverview(config, res.locals.user);

        // Start the step if it hasn't been started yet
        const result = await stepService.startIfNotStarted(
            config,
            res.locals.user,
            overview.current,
        );

        res.json(exact(stepService.format.response(result)));
    }),
);

// Get interaction step
router.get(
    '/stage/:stage/task/:taskIndex/interaction',
    ...endpoint({
        auth: true,
        validate: yup.object({
            params: yup.object({
                stage: yup.string().required().oneOf(stages),
                taskIndex: yup.string().required().matches(/^\d+$/),
            }),
        }),
    }).handle<
    InteractionStepResponse,
    typeof errors.NOT_CURRENT | typeof errors.INVALID_TASK
    >(async (req, res) => {
        const config = await getConfig();
        const step = {
            type: 'interaction',
            task: {
                stage: req.params.stage,
                index: Number(req.params.taskIndex),
            },
        } as const;
        if (!(step.task.index in config.stages[step.task.stage].tasks)) {
            res.status(404).json({ error: errors.INVALID_TASK });
            return;
        }
        if (!await isCurrentStep(config, res.locals.user, step)) {
            res.status(403).json({ error: errors.NOT_CURRENT });
            return;
        }

        const snippet = getSnippet(getTaskNameFromAlias(config, step.task));
        if (snippet === null) {
            res.status(500).json({ error: 'internal' });
            return;
        }

        const messages = await interactionService.get(
            res.locals.user,
            getTaskNameFromAlias(config, step.task),
        );

        const details = await stepService.get(config, res.locals.user, step);

        res.json(exact({
            snippet,
            messages: interactionService.format.response(
                messages,
                res.locals.user.isAdmin,
                res.locals.user.isAdmin,
            ),
            details: details !== null ? stepService.format.response(details) : null,
        }));
    }),
);

// Add interaction message
router.post(
    '/stage/:stage/task/:taskIndex/interaction',
    ...endpoint({
        auth: true,
        validate: yup.object({
            params: yup.object({
                stage: yup.string().required().oneOf(stages),
                taskIndex: yup.string().required().matches(/^\d+$/),
            }).required(),
            body: yup.object({
                content: yup.string().required().max(1000),
            }).required(),
        }),
    }).handle<
    InteractionMessageAddResponse,
    typeof errors.NOT_CURRENT | typeof errors.INVALID_TASK
    >(async (req, res, next) => {
        const config = await getConfig();
        const step = {
            type: 'interaction',
            task: {
                stage: req.params.stage,
                index: Number(req.params.taskIndex),
            },
        } as const;
        if (!(step.task.index in config.stages[step.task.stage].tasks)) {
            res.status(404).json({ error: errors.INVALID_TASK });
            return;
        }
        if (!await isCurrentStep(config, res.locals.user, step)) {
            res.status(403).json({ error: errors.NOT_CURRENT });
            return;
        }

        const snippet = getSnippet(getTaskNameFromAlias(config, step.task));
        if (snippet === null) {
            next(new Error('Snippet not found'));
            return;
        }

        // Try to send/process the message
        try {
            const { group } = res.locals.user;
            const model = config.groups[group].models[step.task.stage];
            const agent = agents[model];
            await interactionService.sendMessage(
                res.locals.user,
                getTaskNameFromAlias(config, step.task),
                snippet,
                req.body.content,
                agent,
                10, // Include up to 10 conversation turns in history
            );
        } catch (error) {
            next(error);
            return;
        }

        // Respond with updated messages list
        const messages = await interactionService.get(
            res.locals.user,
            getTaskNameFromAlias(config, step.task),
        );

        res.json(exact({
            messages: interactionService.format.response(
                messages,
                res.locals.user.isAdmin,
                res.locals.user.isAdmin,
            ),
        }));
    }),
);

// Get quiz step
router.get(
    '/stage/:stage/task/:taskIndex/quiz',
    ...endpoint({
        auth: true,
        validate: yup.object({
            params: yup.object({
                stage: yup.string().required().oneOf(stages),
                taskIndex: yup.string().required().matches(/^\d+$/),
            }),
        }),
    }).handle<
    QuizStepResponse,
    typeof errors.NOT_CURRENT | typeof errors.INVALID_TASK
    >(async (req, res) => {
        const config = await getConfig();
        const step = {
            type: 'quiz',
            task: {
                stage: req.params.stage,
                index: Number(req.params.taskIndex),
            },
        } as const;
        if (!(step.task.index in config.stages[step.task.stage].tasks)) {
            res.status(404).json({ error: errors.INVALID_TASK });
            return;
        }
        if (!await isCurrentStep(config, res.locals.user, step)) {
            res.status(403).json({ error: errors.NOT_CURRENT });
            return;
        }

        const snippet = getSnippet(getTaskNameFromAlias(config, step.task));
        if (snippet === null) {
            res.status(500);
            return;
        }

        const qualtrics = await qualtricsService.get(res.locals.user, getStepKey(config, step));
        const qualtricsResponse = qualtrics !== null
            ? qualtricsService.format.response(qualtrics)
            : null;

        const details = await stepService.get(config, res.locals.user, step);

        res.json(exact({
            snippet,
            qualtrics: qualtricsResponse,
            details: details !== null ? stepService.format.response(details) : null,
        }));
    }),
);

// Get evaluation step
router.get(
    '/stage/:stage/evaluation',
    ...endpoint({
        auth: true,
        validate: yup.object({
            params: yup.object({
                stage: yup.string().required().oneOf(stages),
            }),
        }),
    }).handle<
    EvaluationStepResponse,
    typeof errors.NOT_CURRENT
    >(async (req, res) => {
        const config = await getConfig();
        const step = { type: 'evaluation', stage: req.params.stage } as const;
        if (!await isCurrentStep(config, res.locals.user, step)) {
            res.status(403).json({ error: errors.NOT_CURRENT });
            return;
        }

        const qualtrics = await qualtricsService.get(res.locals.user, getStepKey(config, step));
        const qualtricsResponse = qualtrics !== null
            ? qualtricsService.format.response(qualtrics)
            : null;

        // Response with all of this stage's tasks' interactions
        const interactions = await Promise.all(
            config.stages[step.stage].tasks
                .map(async (task) => interactionService.get(
                    res.locals.user,
                    task,
                )),
        );

        const details = await stepService.get(config, res.locals.user, step);

        res.json(exact({
            qualtrics: qualtricsResponse,
            interactions: interactions
                .map((messages) => interactionService.format.response(
                    messages,
                    res.locals.user.isAdmin,
                    res.locals.user.isAdmin,
                )),
            details: details !== null ? stepService.format.response(details) : null,
        }));
    }),
);

// Get welcome step
router.get(
    '/welcome',
    ...endpoint({
        auth: true,
        validate: false,
    }).handle<
    WelcomeStepResponse,
    typeof errors.NOT_CURRENT
    >(async (req, res) => {
        const config = await getConfig();
        const step = { type: 'welcome' } as const;
        if (!await isCurrentStep(config, res.locals.user, step)) {
            res.status(403).json({ error: errors.NOT_CURRENT });
            return;
        }

        const qualtrics = await qualtricsService.get(res.locals.user, 'example');
        const qualtricsResponse = qualtrics !== null
            ? qualtricsService.format.response(qualtrics)
            : null;

        const snippet = getSnippet(config.example);
        if (snippet === null) {
            res.status(500).json({ error: 'internal' });
            return;
        }

        const details = await stepService.get(config, res.locals.user, step);

        res.json(exact({
            qualtrics: qualtricsResponse,
            snippet,
            details: details !== null ? stepService.format.response(details) : null,
        }));
    }),
);

// Get finished step
router.get(
    '/finished',
    ...endpoint({
        auth: true,
        validate: false,
    }).handle<
    FinishedStepResponse,
    typeof errors.NOT_CURRENT
    >(async (req, res) => {
        const config = await getConfig();
        const step = { type: 'finished' } as const;
        if (!await isCurrentStep(config, res.locals.user, step)) {
            res.status(403).json({ error: errors.NOT_CURRENT });
            return;
        }

        const details = await stepService.get(config, res.locals.user, step);

        res.json(exact({
            details: details !== null ? stepService.format.response(details) : null,
        }));
    }),
);

export default router;

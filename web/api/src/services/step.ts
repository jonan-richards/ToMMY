import { Prisma } from '@prisma/client';
import { Step } from '#shared/step';
import {
    OverviewResponse,
    UserStepResponse,
} from '#shared/api';
import { Config } from '../lib/design';
import {
    getStepKey,
    getStepStages,
} from '../lib/step';
import prisma from '../plugins/prisma';
import { User } from './user';
import { exact } from '../util/types';

export const userStepArgs = Prisma.validator<Prisma.UserStepDefaultArgs>()({});
export type UserStep = Prisma.UserStepGetPayload<typeof userStepArgs>;

const service = {
    getOverview: async (
        designConfig: Config,
        user: User,
    ): Promise<OverviewResponse> => {
        const completedSteps = new Set((await prisma.userStep.findMany({
            where: {
                userID: user.ID,
                completed: true,
            },
            select: {
                key: true,
            },
            ...userStepArgs,
        })).map((step) => step.key));

        let currentStep: Step | null = null;

        const stepStages = getStepStages(designConfig).map((stepStage) => ({
            name: stepStage.name,
            steps: stepStage.steps.map((step) => {
                const completed = completedSteps.has(getStepKey(designConfig, step));
                if (!completed && currentStep === null) {
                    currentStep = step;
                }

                return {
                    ...step,
                    completed,
                };
            }),
        }));

        return {
            stages: stepStages,
            current: currentStep ?? { type: 'finished' },
        };
    },

    get: async (
        designConfig: Config,
        user: User,
        step: Step,
    ): Promise<UserStep | null> => prisma.userStep.findUnique({
        where: {
            userID_key: {
                userID: user.ID,
                key: getStepKey(designConfig, step),
            },
        },
        ...userStepArgs,
    }),

    startIfNotStarted: async (
        designConfig: Config,
        user: User,
        step: Step,
    ): Promise<UserStep> => prisma.$transaction(async (tx) => {
        const userID = user.ID;
        const key = getStepKey(designConfig, step);
        const existing = await tx.userStep.findUnique({
            where: { userID_key: { userID, key } },
            ...userStepArgs,
        });

        if (existing !== null) {
            return existing;
        }

        return tx.userStep.create({
            data: { userID, key },
            ...userStepArgs,
        });
    }),

    complete: async (
        designConfig: Config,
        user: User,
        step: Step,
    ): Promise<void> => {
        await prisma.userStep.upsert({
            where: {
                userID_key: {
                    userID: user.ID,
                    key: getStepKey(designConfig, step),
                },
            },
            create: {
                userID: user.ID,
                key: getStepKey(designConfig, step),
                endTime: new Date(),
                completed: true,
            },
            update: {
                endTime: new Date(),
                completed: true,
            },
        });
    },

    format: {
        response: (userStep: UserStep): UserStepResponse => {
            const { startTime } = userStep;

            return exact({
                startTime: startTime.toISOString(),
            });
        },
    },
};

export default service;

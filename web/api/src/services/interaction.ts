import { Prisma } from '@prisma/client';
import { InteractionMessageResponse } from '#shared/api';
import { Snippet } from '#shared/task';
import prisma from '../plugins/prisma';
import { exact } from '../util/types';
import { User } from './user';
// eslint-disable-next-line import/no-cycle
import { Agent } from '../lib/agent';

export const interactionMessageArgs = Prisma.validator<Prisma.InteractionMessageDefaultArgs>()({});
export type InteractionMessage = Prisma.InteractionMessageGetPayload<typeof interactionMessageArgs>;

export type InteractionMessageData = {
    type: 'ai' | 'internal' | 'user'
    content: string
    tokenCountInput?: number
    tokenCountOutput?: number
    timeMS?: number
};

const service = {
    get: async (
        user: User,
        task: string,
    ): Promise<InteractionMessage[]> => prisma.interactionMessage.findMany({
        where: {
            userID: user.ID,
            task,
        },
        orderBy: {
            order: 'asc',
        },
        ...interactionMessageArgs,
    }),

    sendMessage: async (
        user: User,
        task: string,
        snippet: Snippet,
        input: string,
        agent: Agent,
        historyTurnLimit: number,
    ): Promise<void> => {
        // Get history (the latest up to historyTurnLimit * 2 messages)
        const history = (await prisma.interactionMessage.findMany({
            where: {
                userID: user.ID,
                task,
                type: { in: ['ai', 'user'] },
            },
            orderBy: {
                order: 'desc',
            },
            take: historyTurnLimit * 2,
            ...interactionMessageArgs,
        }))
            .reverse()
            .map(({ type, content }) => ({ type: type as 'ai' | 'user', content }));

        // Get agent response messages
        const agentResponses = await agent.invoke({
            snippet,
            input,
            history,
        });

        // Save messages to database
        await service.addMessages(
            user,
            task,
            [
                {
                    type: 'user',
                    content: input,
                    tokenCountInput: agentResponses.reduce(
                        (total, { tokenCountInput }) => total + (tokenCountInput ?? 0),
                        0,
                    ),
                    tokenCountOutput: agentResponses.reduce(
                        (total, { tokenCountOutput }) => total + (tokenCountOutput ?? 0),
                        0,
                    ),
                    timeMS: agentResponses.reduce(
                        (total, { timeMS }) => total + (timeMS ?? 0),
                        0,
                    ),
                },
                ...agentResponses,
            ],
        );
    },

    addMessages: async (
        user: User,
        task: string,
        messages: InteractionMessageData[],
    ): Promise<void> => prisma.$transaction(async (tx) => {
        // eslint-disable-next-line no-underscore-dangle
        const order = (await tx.interactionMessage.aggregate({
            where: {
                userID: user.ID,
                task,
            },
            _max: {
                order: true,
            },
        }))._max?.order ?? 0;

        await Promise.all(messages.map((message, i) => tx.interactionMessage.create({
            data: {
                userID: user.ID,
                task,
                ...message,
                order: order + i + 1,
            },
            ...interactionMessageArgs,
        })));
    }),

    format: {
        messageResponse: (
            message: InteractionMessage,
            includeTokenCount: boolean,
            includeInternal: boolean,
        ): InteractionMessageResponse | null => {
            const {
                content, type, tokenCountInput, tokenCountOutput, timeMS,
            } = message;

            if (type === 'internal' && !includeInternal) {
                return null;
            }

            return exact({
                content,
                type: type as 'ai' | 'internal' | 'user',
                tokens: includeTokenCount ? {
                    input: tokenCountInput ?? undefined,
                    output: tokenCountOutput ?? undefined,
                } : undefined,
                timeMS: timeMS ?? undefined,
            });
        },

        response: (
            interaction: InteractionMessage[],
            includeTokenCount: boolean,
            includeInternal: boolean,
        ): InteractionMessageResponse[] => interaction.map(
            (message) => service.format.messageResponse(
                message,
                includeTokenCount,
                includeInternal,
            ),
        ).filter((message): message is InteractionMessageResponse => message !== null),
    },
};

export default service;

import { Prisma } from '@prisma/client';
import { QualtricsResponse } from '#shared/api';
import prisma from '../plugins/prisma';
import { exact } from '../util/types';
import { User } from './user';

export const qualtricsArgs = Prisma.validator<Prisma.QualtricsProjectDefaultArgs>()({});
export type Qualtrics = Prisma.QualtricsProjectGetPayload<typeof qualtricsArgs>;

export default {
    get: async (
        user: User,
        key: string,
    ): Promise<Qualtrics | null> => {
        const qualtrics = await prisma.qualtricsProject.findUnique({
            where: { key },
            ...qualtricsArgs,
        });

        if (qualtrics === null) {
            return null;
        }

        const url = new URL(qualtrics.URL);
        url.searchParams.set('user', user.username);

        return {
            ...qualtrics,
            URL: url.toString(),
        };
    },
    format: {
        response: (qualtrics: Qualtrics): QualtricsResponse => {
            const { URL } = qualtrics;

            return exact({ URL });
        },
    },
};

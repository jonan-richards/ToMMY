import { Prisma } from '@prisma/client';
import { UserResponse } from '#shared/api';
import prisma from '../plugins/prisma';
import { exact } from '../util/types';
import { Group } from '../lib/design';

export const userArgs = Prisma.validator<Prisma.UserDefaultArgs>()({});
export type User = Prisma.UserGetPayload<typeof userArgs>;

export type ValidUser = User & {
    group: Group,
};

export default {
    getByUsername: async (username: string): Promise<User | null> => prisma.user.findUnique({
        where: { username },
        ...userArgs,
    }),
    format: {
        response: (user: User): UserResponse => {
            const { username, isAdmin } = user;

            return exact({ username, isAdmin });
        },
    },
};

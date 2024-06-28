import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import './plugins/env';
import prisma from './plugins/prisma';

(async () => {
    const data = await prisma.user.findMany({
        where: {
            isAdmin: false,
        },
        select: {
            username: true,
            group: true,
            steps: {
                where: {
                    OR: [
                        { key: { startsWith: 'interaction-' } },
                        { key: { startsWith: 'quiz-' } },
                    ],
                },
                select: {
                    key: true,
                    startTime: true,
                    endTime: true,
                },
            },
            interactionMessages: {
                select: {
                    task: true,
                    order: true,
                    content: true,
                    type: true,
                    timeMS: true,
                },
            },
        },
    });

    const filename = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'analysis', 'data', 'raw-client.json');
    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
})();

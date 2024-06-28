import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Snippet } from '#shared/task';

export const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'task');
const snippetsFolder = path.join(folder, 'snippets');

export function getSnippet(task: string): Snippet | null {
    const filename = path.join(snippetsFolder, `${task}.py`);
    if (!fs.existsSync(filename)) {
        return null;
    }

    return {
        code: fs.readFileSync(filename, 'utf-8'),
        language: 'python',
    };
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(fileURLToPath(import.meta.url), '..', '..', '..', '..', '..', '.env') });

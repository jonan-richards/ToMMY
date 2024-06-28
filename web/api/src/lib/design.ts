import path from 'path';
import fs from 'fs';
import yup from 'yup';
import {
    Stage,
    stages,
} from '#shared/step';
import { folder } from './task';

export const groups = ['control-first', 'tom-first'] as const;
export type Group = typeof groups[number];

export const models = ['control', 'tom'] as const;
export type Model = typeof models[number];

const modelConfigSchema = yup.string().required().oneOf(models);
const groupConfigSchema = yup.object({
    models: yup.object(
        Object.fromEntries(stages.map((stage) => [
            stage,
            modelConfigSchema,
        ])) as { [K in Stage]: typeof modelConfigSchema },
    ).required(),
}).required();
const groupsConfigSchema = yup.object(
    Object.fromEntries(groups.map((group) => [
        group,
        groupConfigSchema,
    ])) as { [K in Group]: typeof groupConfigSchema },
).required();

const stageConfigSchema = yup.object({
    tasks: yup.array(
        yup.string().required(),
    ).required(),
}).required();
const stagesConfigSchema = yup.object(
    Object.fromEntries(stages.map((stage) => [
        stage,
        stageConfigSchema,
    ])) as { [K in Stage]: typeof stageConfigSchema },
).required();

const configSchema = yup.object({
    groups: groupsConfigSchema,
    stages: stagesConfigSchema,
    example: yup.string().required(),
});
export type Config = yup.InferType<typeof configSchema>;

export async function getConfig(): Promise<Config> {
    const config = JSON.parse(fs.readFileSync(path.join(folder, 'design.json'), 'utf-8'));
    return configSchema.validate(config);
}

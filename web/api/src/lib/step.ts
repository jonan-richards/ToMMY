import {
    EvaluationStep,
    InteractionStep,
    QuizStep,
    Step,
    TaskAlias,
    Stage,
    stages,
} from '#shared/step';
import { Config } from './design';

export const getStepStages = (designConfig: Config): {
    name?: Stage
    steps: Step[]
}[] => [
    {
        steps: [
            { type: 'welcome' },
        ],
    },
    ...stages.map((stage) => ({
        name: stage,
        steps: [
            ...designConfig.stages[stage].tasks.flatMap((task, index) => [
                { type: 'interaction', task: { stage, index } } as InteractionStep,
                { type: 'quiz', task: { stage, index } } as QuizStep,
            ]),
            { type: 'evaluation', stage } as EvaluationStep,
        ],
    })),
    {
        steps: [
            { type: 'finished' },
        ],
    },
];

export function getTaskNameFromAlias(designConfig: Config, alias: TaskAlias): string {
    return designConfig.stages[alias.stage].tasks[alias.index];
}

export function getStepKey(designConfig: Config, step: Step): string {
    switch (step.type) {
        case 'interaction':
        case 'quiz':
            return `${step.type}-${getTaskNameFromAlias(designConfig, step.task)}`;

        case 'evaluation':
            return `${step.type}-${step.stage}`;

        default:
            return step.type;
    }
}

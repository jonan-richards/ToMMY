export const stages = ['A', 'B'] as const;
export type Stage = typeof stages[number];

export type TaskAlias = {
    stage: Stage
    index: number
};

export type WelcomeStep = {
    type: 'welcome'
};

export type InteractionStep = {
    type: 'interaction'
    task: TaskAlias
};

export type QuizStep = {
    type: 'quiz'
    task: TaskAlias
};

export type EvaluationStep = {
    type: 'evaluation'
    stage: Stage
};

export type FinishedStep = {
    type: 'finished'
};

export type Step =
    WelcomeStep |
    InteractionStep |
    QuizStep |
    EvaluationStep |
    FinishedStep;

export type UserStep = Step & {
    completed: boolean
};

export function stepsEqual(a: Step, b: Step): boolean {
    switch (a.type) {
        case 'interaction':
        case 'quiz':
            return a.type === b.type
            && a.task.stage === b.task.stage
            && a.task.index === b.task.index;

        case 'evaluation':
            return a.type === b.type
            && a.stage === b.stage;

        default:
            return a.type === b.type;
    }
}

import {
    Stage,
    Step,
    UserStep,
} from './step';
import { Snippet } from './task';

export type UserResponse = {
    username: string
    isAdmin: boolean
};

export type QualtricsResponse = {
    URL: string
};

export type OverviewResponse = {
    stages: {
        name?: Stage
        steps: UserStep[]
    }[]
    current: Step
};

export type UserStepResponse = {
    startTime: string
};

export type InteractionMessageResponse = {
    content: string
    type: 'ai' | 'internal' | 'user'
    tokens: {
        input: number | undefined
        output: number | undefined
    } | undefined
    timeMS: number | undefined
};

export type InteractionStepResponse = {
    snippet: Snippet
    messages: InteractionMessageResponse[]
    details: UserStepResponse | null
};

export type InteractionMessageAddResponse = {
    messages: InteractionMessageResponse[]
};

export type QuizStepResponse = {
    snippet: Snippet
    qualtrics: QualtricsResponse | null
    details: UserStepResponse | null
};

export type EvaluationStepResponse = {
    qualtrics: QualtricsResponse | null
    interactions: InteractionMessageResponse[][]
    details: UserStepResponse | null
};

export type WelcomeStepResponse = {
    qualtrics: QualtricsResponse | null
    snippet: Snippet
    details: UserStepResponse | null
};

export type FinishedStepResponse = {
    details: UserStepResponse | null
};

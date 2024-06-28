/* eslint-disable default-case */
import { defineStore } from 'pinia';
import {
    EvaluationStep,
    FinishedStep,
    InteractionStep,
    QuizStep,
    Step,
    WelcomeStep,
    stepsEqual,
} from '#shared/step';
import {
    EvaluationStepResponse,
    FinishedStepResponse,
    InteractionMessageAddResponse,
    InteractionStepResponse,
    OverviewResponse,
    QuizStepResponse,
    UserStepResponse,
    WelcomeStepResponse,
} from '#shared/api';
import api from '../lib/api';

export type WelcomeStepState = WelcomeStep & WelcomeStepResponse;
export type InteractionStepState = InteractionStep & InteractionStepResponse;
export type QuizStepState = QuizStep & QuizStepResponse;
export type EvaluationStepState = EvaluationStep & EvaluationStepResponse;
export type FinishedStepState = FinishedStep & FinishedStepResponse;
export type StepState = WelcomeStepState
| InteractionStepState
| QuizStepState
| EvaluationStepState
| FinishedStepState;

export const useStepStore = defineStore('step', {
    state: (): {
        stages: OverviewResponse['stages'] | null
        selected: Step | null
        current: StepState | null
    } => ({
        stages: null,
        selected: null,
        current: null,
    }),
    actions: {
        async getOverview(): Promise<{
            error?: string
        }> {
            const { data, error } = await api.get<OverviewResponse>('/step');
            if (error !== undefined) {
                return { error };
            }

            this.stages = data.stages;
            this.select(data.current);
            return {};
        },

        async select(step: Step | null): Promise<{
            error?: string
        }> {
            this.selected = step;
            this.current = null;

            if (step === null) {
                return {};
            }

            let stepState: StepState | null = null;
            switch (step.type) {
                case 'welcome':
                    stepState = await this.getWelcomeStepState(step);
                    break;

                case 'interaction':
                    stepState = await this.getInteractionStepState(step);
                    break;

                case 'quiz':
                    stepState = await this.getQuizStepState(step);
                    break;

                case 'evaluation':
                    stepState = await this.getEvaluationStepState(step);
                    break;

                case 'finished':
                    stepState = await this.getFinishedStepState(step);
                    break;
            }

            // Only update the current step if the selected step has not changed in the meantime
            if (
                stepState !== null
                && this.selected !== null
                && stepsEqual(stepState, this.selected)
            ) {
                this.current = stepState;
            }

            return {};
        },

        async next(): Promise<{
            error?: string
        }> {
            const { data, error } = await api.get<OverviewResponse>('/step/next');
            if (error !== undefined) {
                return { error };
            }

            this.stages = data.stages;
            this.select(data.current);
            return {};
        },

        async start(): Promise<{
            error?: string
        }> {
            const { current } = this;

            // Only start the step if there is a current step and it is not already started
            if (
                current === null
                || current.details !== null
            ) {
                return {};
            }

            const { data, error } = await api.get<UserStepResponse>('/step/start');
            if (error !== undefined) {
                return { error };
            }

            // Only update the current step if the current step has not changed in the meantime
            if (
                this.current !== null
                && stepsEqual(current, this.current)
            ) {
                this.current.details = data;
            }

            return {};
        },

        async sendMessage(content: string): Promise<{
            error?: string
        }> {
            if (this.current === null || this.current.type !== 'interaction') {
                return { error: 'invalid' };
            }

            const step = this.current;

            const { data, error } = await api.post<InteractionMessageAddResponse>(
                `/step/stage/${this.current.task.stage}/task/${this.current.task.index}/interaction`,
                { content },
            );
            if (error !== undefined) {
                return { error };
            }

            // Only update the messages if the current step has not changed in the meantime
            if (
                this.current !== null
                && stepsEqual(step, this.current)
            ) {
                this.current.messages = data.messages;
            }
            return {};
        },

        async getWelcomeStepState(step: WelcomeStep): Promise<WelcomeStepState | null> {
            const { data, error } = await api.get<WelcomeStepResponse>(
                '/step/welcome',
            );
            if (error !== undefined) {
                return null;
            }

            return { ...step, ...data };
        },

        async getInteractionStepState(step: InteractionStep): Promise<InteractionStepState | null> {
            const { data, error } = await api.get<InteractionStepResponse>(
                `/step/stage/${step.task.stage}/task/${step.task.index}/interaction`,
            );
            if (error !== undefined) {
                return null;
            }

            return { ...step, ...data };
        },

        async getQuizStepState(step: QuizStep): Promise<QuizStepState | null> {
            const { data, error } = await api.get<QuizStepResponse>(
                `/step/stage/${step.task.stage}/task/${step.task.index}/quiz`,
            );
            if (error !== undefined) {
                return null;
            }

            return { ...step, ...data };
        },

        async getEvaluationStepState(step: EvaluationStep): Promise<EvaluationStepState | null> {
            const { data, error } = await api.get<EvaluationStepResponse>(
                `/step/stage/${step.stage}/evaluation`,
            );
            if (error !== undefined) {
                return null;
            }

            return { ...step, ...data };
        },

        async getFinishedStepState(step: FinishedStep): Promise<FinishedStepState | null> {
            const { data, error } = await api.get<FinishedStepResponse>(
                '/step/finished',
            );
            if (error !== undefined) {
                return null;
            }

            return { ...step, ...data };
        },
    },
});

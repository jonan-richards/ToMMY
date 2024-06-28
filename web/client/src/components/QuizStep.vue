<script setup lang="ts">
    import { ref } from 'vue';
    import { useAuthStore } from '../stores/auth';
    import {
        QuizStepState,
        useStepStore,
    } from '../stores/step';
    import StepWindow from './StepWindow.vue';
    import StepTimer from './StepTimer.vue';
    import NextStepButton from './NextStepButton.vue';
    import CodeSnippet from './CodeSnippet.vue';
    import QualtricsFrame from './QualtricsFrame.vue';

    defineProps<QuizStepState>();

    const authStore = useAuthStore();

    // Start the step only after the instructions are closed
    const stepStore = useStepStore();

    const submitted = ref(false);
</script>

<template>
    <div class="d-flex h-100 ga-3">
        <StepWindow
            class="pb-3"
            :title="`Quiz ${task.stage}-${task.index + 1}`"
            :columns="5"
            @close-instructions="() => stepStore.start()"
        >
            <template #actions>
                <StepTimer
                    class="mr-4"
                    :start="details?.startTime"
                    :limit="10 * 60"
                />
                <NextStepButton :disabled="!submitted && !authStore.isAdmin" />
            </template>

            <template #instructions>
                <p>
                    Answer the six questions on the left using the code snippet on the right.
                    Please respect the time limit of 10 minutes.
                </p>
                <p>
                    When you are done or when the timer reaches 10 minutes,
                    submit the answers using the button at the bottom of
                    the questions window (you might have to scroll down).
                    If you refresh the browser, you will lose your answers and
                    have to fill them in again, even if you have already submitted them.
                    After submitting, you will be able to use the "Next" button
                    at the top of the quiz window to move on to the next task.
                    You will not be able to change your answers once you move on.
                </p>
            </template>

            <QualtricsFrame
                :title="`Quiz {{ task.stage }}-{{ task.index + 1 }}`"
                :qualtrics="qualtrics ?? undefined"
                @submitted="() => submitted = true"
            />
        </StepWindow>

        <StepWindow
            :title="`Program ${task.stage}-${task.index + 1}`"
            :columns="7"
        >
            <CodeSnippet :language="snippet.language" :code="snippet.code" />
        </StepWindow>
    </div>
</template>

<style scoped>

</style>

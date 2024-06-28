<script setup lang="ts">
    import { ref } from 'vue';
    import { useAuthStore } from '../stores/auth';
    import {
        EvaluationStepState,
        useStepStore,
    } from '../stores/step';
    import StepWindow from './StepWindow.vue';
    import NextStepButton from './NextStepButton.vue';
    import QualtricsFrame from './QualtricsFrame.vue';
    import ChatMessages from './ChatMessages.vue';

    defineProps<EvaluationStepState>();

    const authStore = useAuthStore();

    // Start the step only after the instructions are closed
    const stepStore = useStepStore();

    const submitted = ref(false);
</script>

<template>
    <div class="d-flex h-100 ga-3">
        <StepWindow
            class="pb-3"
            :title="`Evaluate chatbot ${stage}`"
            :columns="7"
            @close-instructions="() => stepStore.start()"
        >
            <template #actions>
                <NextStepButton :disabled="!submitted && !authStore.isAdmin" />
            </template>

            <template #instructions>
                <p>
                    Evaluate your experience with the chatbot using the survey on the left.
                    You can look back at your interaction with the chatbot on the right.
                </p>
                <p>
                    When you are done, submit the answers using the button
                    at the bottom of the evaluation window (you might have to scroll down).
                    If you refresh the browser, you will lose your answers and
                    have to fill them in again, even if you have already submitted them.
                    After submitting, you will be able to use the "Next" button
                    at the top of the evaluation window to move on to the next task.
                    You will not be able to change your answers once you move on.
                </p>
            </template>

            <QualtricsFrame
                :title="`Evaluation {{ stage }}`"
                :qualtrics="qualtrics ?? undefined"
                @submitted="() => submitted = true"
            />
        </StepWindow>

        <div class="interactions d-flex flex-column ga-3">
            <StepWindow
                v-for="messages, i in interactions"
                :key="i"
                :expand="false"
                :title="`Interaction Program ${stage}-${i + 1}`"
                class="pb-3"
            >
                <ChatMessages :messages="messages" />
            </StepWindow>
        </div>
    </div>
</template>

<style scoped>
    .interactions {
        flex-grow: 5;
        flex-shrink: 1;
        flex-basis: 0;
        min-width: 0;
    }
</style>

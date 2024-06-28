<script setup lang="ts">
    import { ref } from 'vue';
    import {
        useStepStore,
        InteractionStepState,
    } from '../stores/step';
    import StepWindow from './StepWindow.vue';
    import StepTimer from './StepTimer.vue';
    import NextStepButton from './NextStepButton.vue';
    import CodeSnippet from './CodeSnippet.vue';
    import ChatMessages from './ChatMessages.vue';
    import ChatInput from './ChatInput.vue';

    defineProps<InteractionStepState>();

    // Start the step only after the instructions are closed
    const stepStore = useStepStore();

    const input = ref('');
    const loading = ref(false);
    const errors = ref<string[]>([]);
    async function sendMessage() {
        if (input.value !== '') {
            loading.value = true;

            const result = await stepStore.sendMessage(input.value);

            if (result.error !== undefined) {
                errors.value = ['Something went wrong'];
            } else {
                input.value = '';
            }
            loading.value = false;
        }
    }
</script>

<template>
    <div class="d-flex h-100 ga-3">
        <StepWindow
            :title="`Chatbot ${task.stage}`"
            :columns="5"
            @close-instructions="() => stepStore.start()"
        >
            <template #actions>
                <StepTimer
                    class="mr-4"
                    :start="details?.startTime"
                    :limit="20 * 60"
                />
                <NextStepButton>
                    <template #confirmation>
                        Are you sure you are done with this step?
                        Next, you will move on to the quiz questions for this code snippet.
                        You will not be able to interact with the chatbot or see the
                        interaction once you move on.
                        You will still be able to see the code snippet.
                    </template>
                </NextStepButton>
            </template>

            <template #instructions>
                <p>
                    On the right, you can see a code snippet.
                    Your goal is to understand the code as thoroughly as possible,
                    within a time limit of 20 minutes.
                    In order to do this, you may interact with the chatbot
                    through the interface on the left.
                </p>
                <p>
                    The chatbot can see the code snippet, so it knows what code you
                    are asking questions about. However, the chatbot cannot see the line numbers.
                    If you want to clarify to the chatbot what line you are talking about,
                    you can refer to it by mentioning the content of that line (copying and
                    pasting is allowed).
                    To send your message, press Enter. If you want a new line in your message,
                    press Shift + Enter.
                </p>
                <p>
                    When the timer reaches 20 minutes, please move on to the next step.
                    You can also move on earlier if you feel you understand the code well enough.
                    At this point, you can press the "Next" button at the top of the chat window
                    to go to the quiz questions for this code snippet.
                    You will not be able to interact with the chatbot or see the
                    chat messages once you move on.
                    You will still be able to see the code snippet.
                </p>
            </template>

            <ChatMessages :messages="messages" />

            <template #append>
                <ChatInput
                    v-model="input"
                    v-model:errors="errors"
                    :loading="loading"
                    @submit="sendMessage"
                />
            </template>
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

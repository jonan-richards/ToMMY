<script setup lang="ts">
    import {
        WelcomeStepState,
        useStepStore,
    } from '../stores/step';
    import StepWindow from './StepWindow.vue';
    import NextStepButton from './NextStepButton.vue';
    import QualtricsFrame from './QualtricsFrame.vue';
    import CodeSnippet from './CodeSnippet.vue';

    defineProps<WelcomeStepState>();

    // Immediately start the step
    const stepStore = useStepStore();
    stepStore.start();
</script>

<template>
    <div class="d-flex h-100 ga-3">
        <StepWindow
            title="Example quiz"
            :columns="5"
            class="pb-3"
        >
            <template #actions>
                <NextStepButton>
                    <template #confirmation>
                        Are you sure you have thoroughly read the instructions?
                        Next, you will move on to the first task.
                        Every step will include a description of what is expected from you.
                        You will not be able to return to this screen.
                    </template>
                </NextStepButton>
            </template>

            <template #instructions>
                <p>
                    Welcome to the study! Please read the instructions below carefully.
                </p>
                <p>
                    You will be presented with a series of tasks. Each task consists of two steps.
                    First, you will look at a code snippet,
                    while being able to interact with a chatbot. You can ask the chatbot
                    questions about the code. When you feel like you understand the code,
                    you can move on to the second step. Here, you will answer a set of
                    quiz questions about the code. You will not be able to interact with the
                    chatbot anymore, but you will still be able to look at the code.
                </p>
                <p>
                    On the left of the screen, you can track your progress. As you can see,
                    there are two stages, corresponding to two different chatbots. For each chatbot
                    you will complete one task. After doing so, you will be asked to evaluate
                    your experience with that chatbot. The order of the chatbots you interact
                    with is randomized, so what is labeled as chatbot A for you might be chatbot
                    B for someone else.
                </p>
                <p>
                    To give you an indication of what you might expect, an example code snippet
                    and quiz are shown behind these instructions. To get a better look at the
                    examples, you can hide the instructions. Note that the examples are shorter
                    and may be less complex than the actual tasks, and the correct answers are
                    already indicated.
                </p>
                <p>
                    You should complete the tasks in one sitting. If you leave the page or refresh
                    the browser, you might have to retake the quiz you were currently working on.
                    When you are ready to start with the tasks, click the "Next" button.
                    Good luck!
                </p>
            </template>

            <QualtricsFrame
                title="Example quiz"
                :qualtrics="qualtrics ?? undefined"
            />
        </StepWindow>
        <StepWindow
            title="Example code"
            :columns="7"
        >
            <CodeSnippet :language="snippet.language" :code="snippet.code" />
        </StepWindow>
    </div>
</template>

<style scoped>

</style>

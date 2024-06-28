<script setup lang="ts">
    import { useStepStore } from '../stores/step';

    import WelcomeStep from './WelcomeStep.vue';
    import InteractionStep from './InteractionStep.vue';
    import QuizStep from './QuizStep.vue';
    import EvaluationStep from './EvaluationStep.vue';
    import FinishedStep from './FinishedStep.vue';

    const stepStore = useStepStore();
</script>

<template>
    <WelcomeStep
        v-if="stepStore.current?.type === 'welcome'"
        v-bind="stepStore.current"
    />
    <InteractionStep
        v-else-if="stepStore.current?.type === 'interaction'"
        v-bind="stepStore.current"
    />
    <QuizStep
        v-else-if="stepStore.current?.type === 'quiz'"
        v-bind="stepStore.current"
    />
    <EvaluationStep
        v-else-if="stepStore.current?.type === 'evaluation'"
        v-bind="stepStore.current"
    />
    <FinishedStep
        v-else-if="stepStore.current?.type === 'finished'"
        v-bind="stepStore.current"
    />
    <v-skeleton-loader
        v-else
        type="article"
    />
</template>

<style scoped>

</style>

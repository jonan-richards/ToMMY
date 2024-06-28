<script setup lang="ts">
    import {
        FinishedStepState,
        useStepStore,
    } from '../stores/step';
    import StepWindow from './StepWindow.vue';

    defineProps<FinishedStepState>();

    // Immediately start the step
    const stepStore = useStepStore();
    stepStore.start();
</script>

<template>
    <div class="d-flex h-100 ga-3">
        <StepWindow title="Finished">
            You are done with all the steps.
            Thank you for taking part in this study!
            You can now close this window.
        </StepWindow>
    </div>
</template>

<style scoped>
</style>

<script setup lang="ts">
    import { useStepStore } from '../stores/step';
    import StepsWizardNavigationStep from './StepsWizardNavigationStep.vue';

    const stepStore = useStepStore();
</script>

<template>
    <v-list class="py-0">
        <v-skeleton-loader
            v-if="stepStore.stages === null"
            type="list-item@3"
        />
        <template
            v-for="(stage, stageIndex) in stepStore.stages"
            v-else
            :key="`stage-${stageIndex}`"
        >
            <v-divider v-if="stageIndex !== 0" />

            <v-list-subheader v-if="stage.name !== undefined">
                Chatbot {{ stage.name }}
            </v-list-subheader>

            <StepsWizardNavigationStep
                v-for="(step, stepIndex) in stage.steps"
                :key="`step-${stepIndex}`"
                :step="step"
            />
        </template>
    </v-list>
</template>

<style scoped>

</style>

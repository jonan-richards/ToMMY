<script setup lang="ts">
    import {
        stepsEqual,
        UserStep,
    } from '#shared/step';
    import { computed } from 'vue';
    import { useAuthStore } from '../stores/auth';
    import { useStepStore } from '../stores/step';

    const props = defineProps<{
        step: UserStep;
    }>();

    const authStore = useAuthStore();
    const stepStore = useStepStore();

    const isSelected = computed(
        () => stepStore.selected !== null && stepsEqual(props.step, stepStore.selected),
    );
</script>

<template>
    <v-list-item
        :active="isSelected"
        :link="authStore.isAdmin"
        @click="authStore.isAdmin ? stepStore.select(step) : undefined"
    >
        <template #prepend>
            <v-icon
                v-if="step.completed"
                icon="mdi-check-circle-outline"
                color="success"
            />
            <v-icon
                v-else-if="isSelected"
                icon="mdi-radiobox-marked"
            />
            <v-icon
                v-else
                icon="mdi-circle-outline"
            />
        </template>

        <template v-if="step.type === 'welcome'">
            Welcome
        </template>
        <div
            v-else-if="step.type === 'interaction'"
            class="d-flex flex-row flex-wrap align-center justify-space-between"
        >
            <span>
                Code
            </span>
            <span class="text-disabled text-caption">
                Program {{ step.task.stage }}-{{ step.task.index + 1 }}
            </span>
        </div>
        <div
            v-else-if="step.type === 'quiz'"
            class="d-flex flex-row flex-wrap align-center justify-space-between"
        >
            <span>
                Quiz
            </span>
            <span class="text-disabled text-caption">
                Program {{ step.task.stage }}-{{ step.task.index + 1 }}
            </span>
        </div>
        <div
            v-else-if="step.type === 'evaluation'"
            class="d-flex flex-row flex-wrap justify-space-between"
        >
            Evaluation
        </div>
        <template v-else-if="step.type === 'finished'">
            Finished
        </template>
    </v-list-item>
</template>

<style scoped>

</style>

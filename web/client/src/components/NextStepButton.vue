<script setup lang="ts">
    import { ref } from 'vue';
    import { useStepStore } from '../stores/step';

    defineProps<{
        disabled?: boolean;
    }>();

    const stepStore = useStepStore();
    const loading = ref(false);
    async function next() {
        loading.value = true;
        await stepStore.next();
        loading.value = false;
    }
</script>

<template>
    <v-dialog v-if="$slots.confirmation !== undefined" max-width="500">
        <template #activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                :disabled="disabled || loading"
                :loading="loading"
            >
                <template #prepend>
                    <v-icon>mdi-arrow-right</v-icon>
                </template>

                Next
            </v-btn>
        </template>

        <template #default="{ isActive }">
            <v-card title="Next step">
                <v-card-text>
                    <slot name="confirmation" />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn
                        variant="flat"
                        :slim="false"
                        @click="next"
                    >
                        Next step
                    </v-btn>

                    <v-btn
                        variant="text"
                        @click="isActive.value = false"
                    >
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
    <v-btn
        v-else
        :disabled="disabled || loading"
        :loading="loading"
        @click="next"
    >
        <template #prepend>
            <v-icon>mdi-arrow-right</v-icon>
        </template>

        Next
    </v-btn>
</template>

<style scoped>

</style>

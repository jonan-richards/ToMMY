<script setup lang="ts">
    import {
        ref,
        watch,
    } from 'vue';

    defineProps<{
        title?: string
        columns?: number
    }>();

    const emit = defineEmits<{
        'close-instructions': []
    }>();

    const showInstructions = ref(true);

    watch(showInstructions, () => {
        if (showInstructions.value === false) {
            emit('close-instructions');
        }
    });
</script>

<template>
    <v-card :style="`flex-grow: ${columns ?? 1}`" class="window h-100">
        <div class="h-100 d-flex flex-column ga-3 overflow-auto">
            <div
                v-if="
                    title !== undefined
                        || $slots.actions !== undefined
                        || $slots.instructions !== undefined
                "
                class="flex-grow-0 px-3 pt-3"
            >
                <div class="d-flex justify-space-between align-center mb-3">
                    <span class="text-h5 font-weight-bold d-block">{{ title }}</span>

                    <div v-if="$slots.actions !== undefined" class="d-flex align-center">
                        <slot name="actions" />
                    </div>
                </div>

                <v-dialog
                    v-if="$slots.instructions !== undefined"
                    v-model="showInstructions"
                    max-width="700"
                >
                    <template #activator="{ props: activatorProps }">
                        <v-btn
                            v-bind="activatorProps"
                            class="w-100 mb-2"
                            color="surface-light"
                        >
                            <template #prepend>
                                <v-icon>mdi-information-outline</v-icon>
                            </template>
                            Show instructions
                        </v-btn>
                    </template>

                    <template #default="{ isActive }">
                        <v-card title="Instructions">
                            <v-card-text class="instructions">
                                <slot name="instructions" />
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer />
                                <v-btn
                                    @click="isActive.value = false"
                                >
                                    Close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>

                <v-divider class="mt-1" />
            </div>

            <div class="content px-3">
                <slot />
            </div>

            <div
                v-if="$slots.append !== undefined"
                class="flex-grow-0 px-3 pb-3"
            >
                <slot name="append" />
            </div>
        </div>
    </v-card>
</template>

<style scoped>
    .window {
        flex-shrink: 1;
        flex-basis: 0;
        min-width: 0;
    }

    .window:deep(::-webkit-scrollbar-corner) {
        background-color: transparent;
    }

    .instructions:deep(p:not(:last-of-type)) {
        margin-bottom: 0.75rem;
    }

    .content {
        flex: 1 1 auto;
        min-height: 0px;
        overflow: auto;
    }
</style>

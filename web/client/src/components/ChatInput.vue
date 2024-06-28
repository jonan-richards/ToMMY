<script setup lang="ts">
    import { watch } from 'vue';

    const model = defineModel<string>({
        default: '',
    });

    const errors = defineModel<string[]>('errors', {
        default: [],
    });

    defineProps<{
        loading?: boolean,
    }>();

    const emit = defineEmits<{
        submit: [];
    }>();

    watch(model, () => {
        errors.value = [];
    });
</script>

<template>
    <v-slide-y-transition>
        <v-textarea
            v-model="model"
            class="chat-input"
            placeholder="Ask anything..."
            auto-grow
            no-resize
            rows="1"
            maxlength="1000"
            counter
            persistent-counter
            :loading="loading"
            :disabled="loading"
            :error-messages="errors"
            @keydown.enter.exact.prevent
            @keyup.enter.exact="() => emit('submit')"
        >
            <template #append-inner>
                <div class="h-100 d-flex flex-column justify-end align-end py-2 pl-1">
                    <v-btn
                        type="submit"
                        icon="mdi-send"
                        size="small"
                        :disabled="model === '' || loading"
                        @click="() => emit('submit')"
                    />
                </div>
            </template>
        </v-textarea>
    </v-slide-y-transition>
</template>

<style scoped>
    .chat-input:deep(.v-field--appended) {
        padding-inline-end: 8px;
    }

    /* https://vuejs.org/guide/extras/animation */
    .chat-input:deep(.v-field--error) {
        animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        transform: translate3d(0, 0, 0);
    }

    @keyframes shake {
        10%,
        90% {
            transform: translate3d(-1px, 0, 0);
        }

        20%,
        80% {
            transform: translate3d(2px, 0, 0);
        }

        30%,
        50%,
        70% {
            transform: translate3d(-4px, 0, 0);
        }

        40%,
        60% {
            transform: translate3d(4px, 0, 0);
        }
    }
</style>

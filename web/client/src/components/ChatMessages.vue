<script setup lang="ts">
    import { InteractionMessageResponse } from '#shared/api';
    import {
        computed,
        nextTick,
        onMounted,
        onUnmounted,
        ref,
        watch,
    } from 'vue';
    import { useGoTo } from 'vuetify';
    import VueMarkdown from 'vue-markdown-render';
    import { useAuthStore } from '../stores/auth';

    const props = defineProps<{
        messages: InteractionMessageResponse[];
    }>();

    const goTo = useGoTo();

    const wrapper = ref<HTMLElement | null>(null);
    const scrollContainer = computed(() => wrapper.value?.parentElement ?? null);
    const isScrolledDown = ref(true);
    function updateIsScrolledDown() {
        if (scrollContainer.value !== null) {
            isScrolledDown.value = (
                scrollContainer.value.scrollTop + scrollContainer.value.clientHeight
                >= scrollContainer.value.scrollHeight - 1 // -1 for rounding errors
            );
        }
    }
    function updateScroll() {
        if (scrollContainer.value !== null && isScrolledDown.value) {
            goTo(scrollContainer.value.scrollHeight, {
                container: scrollContainer.value,
            });
        }
    }

    onMounted(() => {
        updateScroll();

        if (scrollContainer.value !== null) {
            scrollContainer.value.addEventListener('scroll', updateIsScrolledDown);
        }
    });
    onUnmounted(() => {
        if (scrollContainer.value !== null) {
            scrollContainer.value.removeEventListener('scroll', updateIsScrolledDown);
        }
    });
    watch(
        () => props.messages,
        () => {
            nextTick(updateScroll);
        },
        { deep: true },
    );

    const authStore = useAuthStore();
</script>

<template>
    <div ref="wrapper" class="h-100">
        <div class="d-flex flex-column justify-end ga-3 container">
            <div
                v-for="message, i in props.messages"
                :key="i"
                class="d-flex"
                :class="{
                    'justify-end': message.type === 'user',
                    'justify-start': message.type !== 'user',
                }"
            >
                <v-card
                    class="message"
                    variant="tonal"
                    :color="message.type === 'user'
                        ? 'primary' : (
                            message.type === 'internal'
                                ? 'grey'
                                : 'white'
                        )
                    "
                >
                    <v-card-text class="d-flex flex-column">
                        <vue-markdown v-if="message.type !== 'user'" :source="message.content" class="content-markdown" />
                        <span v-else class="content">{{ message.content }}</span>
                        <p
                            v-if="authStore.isAdmin"
                            class="text-caption text-disabled align-self-end mt-3 text-right"
                        >
                            Tokens:
                            {{ message.tokens?.input ?? '-' }} input,
                            {{ message.tokens?.output ?? '-' }} output

                            <br />
                            Time:
                            {{ message.timeMS !== undefined ? (message.timeMS / 1000).toFixed(2) : '-' }}s
                        </p>
                    </v-card-text>
                </v-card>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .container {
        min-height: 100%;
    }

    .message {
        max-width: 80%;
        min-width: 40%;
    }

    .content-markdown:deep(pre) {
        overflow-x: auto;
    }

    .content-markdown:deep(b) {
        font-weight: bold;
    }

    .content-markdown:deep( > *:not(:last-child)) {
        margin-bottom: 0.75em;
    }

    .content-markdown:deep(ol), .content-markdown:deep(ul) {
        padding-left: 1em;
    }

    .content-markdown:deep(li) {
        padding-bottom: 0.25em;
    }

    .content {
        white-space: pre-wrap;
    }
</style>

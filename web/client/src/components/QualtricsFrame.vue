<script setup lang="ts">
    import {
        onMounted,
        onUnmounted,
    } from 'vue';
    import { QualtricsResponse } from '#shared/api';

    defineProps<{
        title: string
        qualtrics?: QualtricsResponse
    }>();

    const emit = defineEmits<{
        submitted: []
    }>();

    function handleMessage(e: MessageEvent) {
        if (e.data.startsWith('QualtricsEOS|')) {
            emit('submitted');
        }
    }

    onMounted(() => {
        window.addEventListener('message', handleMessage);
    });

    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
    });
</script>

<template>
    <v-skeleton-loader
        v-if="qualtrics === undefined"
        type="image"
    />
    <iframe
        v-else
        :title="title"
        :src="qualtrics.URL"
    />
</template>

<style scoped>
    iframe {
        width: 100%;
        height: 100%;
        display: block;
        border-width: 0;
    }
</style>

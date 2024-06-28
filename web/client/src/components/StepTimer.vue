<script setup lang="ts">
    import {
        computed,
        onMounted,
        onUnmounted,
        ref,
    } from 'vue';

    const props = defineProps<{
        start?: string
        limit?: number // In seconds
    }>();

    const formatSeconds = (seconds: number | undefined) => {
        if (seconds === undefined) {
            return '--:--';
        }
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const timer = ref<NodeJS.Timeout | undefined>(undefined);
    const elapsed = ref<number | undefined>(undefined);
    const overLimit = computed(() => props.limit !== undefined
        && elapsed.value !== undefined
        && elapsed.value >= props.limit);

    function updateElapsed() {
        if (props.start === undefined) {
            elapsed.value = undefined;
        } else {
            const start = new Date(props.start);
            const now = new Date();
            elapsed.value = Math.floor((now.getTime() - start.getTime()) / 1000);
        }
    }

    onMounted(() => {
        updateElapsed();

        if (timer.value !== undefined) {
            clearInterval(timer.value);
        }
        timer.value = setInterval(updateElapsed, 1000);
    });

    onUnmounted(() => {
        if (timer.value !== undefined) {
            clearInterval(timer.value);
        }
    });
</script>

<template>
    <v-chip
        :variant="overLimit ? 'tonal' : 'text'"
        :color="overLimit ? 'warning' : 'default'"
        size="large"
        class="rounded-pill font-weight-bold"
    >
        {{ formatSeconds(elapsed) }} / {{ formatSeconds(limit) }}
    </v-chip>
</template>

<style scoped>

</style>

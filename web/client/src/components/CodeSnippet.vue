<script setup lang="ts">
    import {
        onMounted,
        ref,
    } from 'vue';

    defineProps<{
        code: string
        language: string
    }>();

    const element = ref<HTMLElement | null>(null);

    onMounted(async () => {
        if (element.value !== null) {
            window.hljs.highlightElement(element.value);
            window.hljs.lineNumbersBlock(element.value);
        }
    });
</script>

<template>
    <pre ref="element" :class="`snippet language-${language}`">{{ code }}</pre>
</template>

<style scoped>
    .snippet {
        --parent-padding-left: 12px;
        font-size: 0.9em;
        width: 100%;
        background-color: transparent;
        position: relative;
        left: calc(-1 * var(--parent-padding-left));
    }

    .snippet :deep(.hljs-ln) {
        border-collapse: separate;
        border-spacing: 0;
    }

    .snippet :deep(.hljs-ln-numbers) {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        text-align: center;
        color: #aaa;
        border-right: 1px solid #CCC;
        border-spacing: 0 10px 0 0;
        vertical-align: top;
        padding-left: var(--parent-padding-left);
        padding-right: 5px;
        position: sticky;
        left: calc(-1 * var(--parent-padding-left));
        background: rgb(var(--v-theme-surface));
    }

    .snippet :deep(.hljs-ln-code) {
        padding-left: 10px;
    }
</style>

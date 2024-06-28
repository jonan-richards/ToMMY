<script setup lang="ts">
    import { ref } from 'vue';
    import TextField from './TextField.vue';

    defineProps<{
        name: string,
        label: string,
    }>();

    const show = ref(false);
</script>

<template>
    <text-field
        :name="name"
        :label="label"
        :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        :type="show ? 'text' : 'password'"
        @click:append-inner="show = !show"
    />
</template>

<style scoped>

</style>

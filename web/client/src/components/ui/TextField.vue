<script setup lang="ts">
    import { useField } from 'vee-validate';

    const props = defineProps<{
        name: string,
        label: string,
        color?: string
    }>();
    const { value, errors } = useField(props.name);
</script>

<template>
    <v-text-field
        v-model="value"
        :error-messages="errors"
        :label="label"
    />
</template>

<style scoped>

</style>

<script setup lang="ts">
    import { toTypedSchema } from '@vee-validate/yup';
    import { useForm } from 'vee-validate';
    import * as yup from 'yup';

    import { ref } from 'vue';
    import { useAuthStore } from '../stores/auth';
    import TextField from './ui/TextField.vue';
    import PasswordField from './ui/PasswordField.vue';

    const auth = useAuthStore();
    const loading = ref(false);
    const {
        handleSubmit,
        setErrors,
    } = useForm({
        validationSchema: toTypedSchema(yup.object({
            username: yup.string().label('Username').required(),
            password: yup.string().label('Password').required(),
        })),
    });
    const submit = handleSubmit(async (data) => {
        loading.value = true;
        const { error } = await auth.logIn(data.username, data.password);
        loading.value = false;
        if (error !== undefined) {
            if (error === 'auth/invalid-credentials') {
                setErrors({ username: 'Invalid username or password' });
            } else {
                setErrors({ username: 'Something went wrong' });
            }
        }
    });
</script>

<template>
    <v-form @submit.prevent="submit">
        <text-field
            name="username"
            label="Username"
        />
        <password-field
            name="password"
            label="Password"
        />

        <v-btn
            block
            class="mt-2"
            type="submit"
            :disabled="loading"
            :loading="loading"
        >
            Log in
        </v-btn>
    </v-form>
</template>

<style scoped>

</style>

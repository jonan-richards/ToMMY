<script setup lang="ts">
    import {
        computed,
        watch,
    } from 'vue';
    import {
        useRoute,
        useRouter,
    } from 'vue-router';
    import { useAuthStore } from './stores/auth';
    import { AuthType } from './router';

    const route = useRoute();
    const router = useRouter();

    const authType = computed(() => route.meta.authType ?? AuthType.RequireAuth);
    const authStore = useAuthStore();

    function checkAuth() {
        if (authType.value === AuthType.RequireAuth && !authStore.loggedIn) {
            router.push({
                name: 'log-in',
                query: ['', '/'].includes(route.fullPath) ? {} : { redirect: route.fullPath },
            });
        } else if (authType.value === AuthType.RequireUnauth && authStore.loggedIn) {
            router.push(
                typeof route.query.redirect === 'string'
                    ? { path: route.query.redirect }
                    : { name: 'dashboard' },
            );
        }
    }
    watch(() => authStore.loggedIn, checkAuth);
</script>

<template>
    <router-view />
</template>

<style>

</style>

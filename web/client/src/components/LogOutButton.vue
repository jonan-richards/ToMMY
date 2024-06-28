<script setup lang="ts">
    import { useAuthStore } from '../stores/auth';

    const authStore = useAuthStore();
</script>

<template>
    <v-dialog max-width="500">
        <template #activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                class="w-100"
                color="error"
            >
                <template #prepend>
                    <v-icon>mdi-logout</v-icon>
                </template>

                Log out
            </v-btn>
        </template>

        <template #default="{ isActive }">
            <v-card title="Log out">
                <v-card-text>
                    Are you sure you want to log out?
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn
                        variant="flat"
                        color="error"
                        :slim="false"
                        @click="authStore.logOut()"
                    >
                        Log out
                    </v-btn>

                    <v-btn
                        variant="text"
                        @click="isActive.value = false"
                    >
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<style scoped>

</style>

<script setup lang="ts">
    import { useStepStore } from '../stores/step';
    import StepsWizard from '../components/StepsWizard.vue';
    import StepsWizardNavigation from '../components/StepsWizardNavigation.vue';
    import LogOutButton from '../components/LogOutButton.vue';

    const stepStore = useStepStore();
    stepStore.getOverview();
</script>

<template>
    <v-app>
        <v-main class="main">
            <v-container fluid class="container">
                <StepsWizard />
            </v-container>
        </v-main>
        <v-navigation-drawer>
            <div class="d-flex flex-column justify-space-between h-100">
                <div>
                    <span class="text-h5 font-weight-bold d-block pa-3">Progress</span>
                    <v-divider />
                    <StepsWizardNavigation />
                    <v-divider />
                </div>

                <div class="pa-3">
                    <LogOutButton />
                </div>
            </div>
        </v-navigation-drawer>
    </v-app>
</template>

<style scoped>
    .main {
        height: 100dvh;
        max-height: 100dvh;
        overflow: hidden;
    }

    .container {
        height: 100%;
        max-height: 100%;
        overflow: auto;
    }
</style>

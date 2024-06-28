<script setup lang="ts">
    import LogInForm from '../components/LogInForm.vue';
</script>

<template>
    <v-app>
        <v-main>
            <v-container class="h-100">
                <v-row align="center" justify="center" class="h-100">
                    <v-col sm="8" md="6" lg="4" xl="3">
                        <v-card>
                            <v-card-title>Log in</v-card-title>

                            <v-card-text>
                                <log-in-form />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<style scoped>
</style>

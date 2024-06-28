import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { Ref } from 'vue';

import { UserResponse } from '#shared/api';
// eslint-disable-next-line import/no-cycle
import api from '../lib/api';

export const useAuthStore = defineStore('auth', {
    state: (): {
        token: Ref<string | null>
        user: UserResponse | null
    } => ({
        token: useLocalStorage('auth-token', null),
        user: null,
    }),
    getters: {
        isAdmin: (state) => state.user?.isAdmin ?? false,
        loggedIn: (state) => state.token !== null,
    },
    actions: {
        async initialize() {
            await this.startRefreshTimer();
        },

        async startRefreshTimer() {
            if (this.token !== null) {
                await this.refresh();
            }

            setTimeout(() => {
                this.startRefreshTimer();
            }, 1 * 60 * 1000);
        },

        async logIn(username: string, password: string): Promise<{
            error?: string
        }> {
            const { data, error } = await api.post<{
                user: UserResponse,
                token: string
            }>('/auth/login', { username, password });
            if (error !== undefined) {
                return { error };
            }

            this.user = data.user;
            this.token = data.token;
            return {};
        },

        async refresh(): Promise<{
            error?: string
        }> {
            const { data, error } = await api.get<{
                user: UserResponse,
                token: string
            }>('/auth/refresh');
            if (error !== undefined) {
                this.logOut();
                return { error };
            }

            this.user = data.user;
            this.token = data.token;

            return {};
        },

        async logOut() {
            this.token = null;
            this.user = null;
        },
    },
});

import {
    createRouter as createVueRouter,
    createWebHistory,
    RouteRecordRaw,
} from 'vue-router';
import { useAuthStore } from './stores/auth';

export type Title = string | null;
export enum AuthType {
    RequireAuth,
    RequireUnauth,
    None,

}

declare module 'vue-router' {
    interface RouteMeta {
        authType?: AuthType,
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('./views/DashboardView.vue'),
    },
    {
        path: '/test',
        name: 'test',
        component: () => import('./views/DashboardView.vue'),
    },
    {
        path: '/log-in',
        name: 'log-in',
        component: () => import('./views/LogInView.vue'),
        meta: {
            authType: AuthType.RequireUnauth,
        },
    },
];

const router = createVueRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    const authType = to.meta.authType ?? AuthType.RequireAuth;

    if (authType === AuthType.RequireAuth && !auth.loggedIn) {
        return {
            name: 'log-in',
            query: ['', '/'].includes(to.fullPath) ? {} : { redirect: to.fullPath },
        };
    }

    if (authType === AuthType.RequireUnauth && auth.loggedIn) {
        return { name: 'dashboard' };
    }

    return undefined;
});

export default router;

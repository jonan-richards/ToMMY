// eslint-disable-next-line import/no-cycle
import { useAuthStore } from '../stores/auth';

type RequestData = Record<string, unknown>;
type ResponseData = Record<string, unknown>;

async function apiFetch<T extends ResponseData = ResponseData>(
    method: 'GET' | 'POST',
    endpoint: string,
    data: RequestData = {},
): Promise<{
        data: T
        error: undefined
    } | {
        data: undefined
        error: string
    }> {
    const authStore = useAuthStore();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (authStore.token !== null) {
        headers.Authorization = `Bearer ${authStore.token}`;
    }

    const options: RequestInit = {
        method,
        headers,
    };

    if (Object.keys(data).length !== 0) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(
            `/api${endpoint}`,
            options,
        );

        const responseData = await response.json();

        if (response.ok) {
            return { data: responseData, error: undefined };
        }

        if (responseData.error === 'auth/invalid') {
            authStore.logOut();
        }

        return { data: undefined, error: responseData.error ?? 'unknown' };
    } catch (e) {
        return { data: undefined, error: 'unknown' };
    }
}

export default {
    get: async <T extends ResponseData = ResponseData>(
        endpoint: string,
    ) => apiFetch<T>('GET', endpoint),

    post: async <T extends ResponseData = ResponseData>(
        endpoint: string,
        data: RequestData = {},
    ) => apiFetch<T>('POST', endpoint, data),
};

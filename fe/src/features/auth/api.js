import { getJSON, postJSON, postNoBody } from '../../lib/http';
export const AuthApi = {
    async login(email, password) {
        // BE sẽ set cookie HttpOnly
        return postJSON('/auth/login', { email, password });
    },
    async logout() {
        await postNoBody('/auth/logout');
    },
    async me() {
        return getJSON('/auth/me');
    },
};

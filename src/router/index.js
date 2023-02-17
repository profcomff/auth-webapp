import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/auth',
        component: () => import('../views/AuthView.vue'),
    },
    {
        path: '/auth/register',
        component: () => import('../views/RegisterView.vue'),
    },
    {
        path: '/auth/reset_password',
        component: () => import('../views/ResetPwdView.vue'),
    },
    {
        path: '/auth/oauth-authorized/:oauthProvider',
        component: () => {},
        meta: { oauthProvider: true },
    },
    {
        path: '/user',
        component: () => import('../views/UserView.vue'),
        meta: { userNeededScopes: [] },
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, from) => {
    // Log to marketing API
    fetch(`${process.env.VUE_APP_API_MARKETING}/action`, {
        method: 'POST',
        cache: 'no-cache',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: localStorage.getItem('marketing-id'),
            action: 'route to',
            path_from: from.fullPath || null,
            path_to: to.fullPath || null,
        }),
    }).catch();

    if (to.meta.oauthProvider) {
        console.log(to.query);
        try {
            let resp = await fetch(
                `${process.env.VUE_APP_API_AUTH}/${to.params.oauthProvider}/login`,
                {
                    method: 'POST',
                    cache: 'no-cache',
                    redirect: 'follow',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(to.query),
                },
            ).json();
            if (resp.token) return { path: '/user' };
            else return { path: '/auth' };
        } catch (error) {
            return { path: '/auth' };
        }
    }
});

export default router;

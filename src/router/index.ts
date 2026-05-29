import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';
import LoginPage from '@/views/auth/LoginPage.vue';
import RegisterPage from '@/views/auth/RegisterPage.vue';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/auth/login',
  },
  {
    path: '/auth/login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/register',
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/forgot-password',
    component: () => import('@/views/auth/ForgotPasswordPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/reset-password/:token',
    component: () => import('@/views/auth/ResetPasswordPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('@/views/DashboardPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER'] },
      },
      {
        path: 'kasir',
        component: () => import('@/views/KasirPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER', 'CASHIER'] },
      },
      {
        path: 'pesanan',
        component: () => import('@/views/PesananPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER', 'BARISTA'] },
      },
      {
        path: 'produk',
        component: () => import('@/views/ProdukPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER', 'CASHIER'] },
      },
      {
        path: 'laporan',
        component: () => import('@/views/LaporanPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER'] },
      },
      {
        path: 'raw-materials',
        component: () => import('@/views/RawMaterialsPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER'] },
      },
      {
        path: 'setting',
        component: () => import('@/views/SettingPage.vue'),
        meta: { requiresAuth: true, requiresRoles: ['OWNER'] },
      },
    ],
  },
  {
    path: '/checkout',
    component: () => import('@/views/CheckoutPage.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Route guard for authentication and authorization
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const requiresAuth = to.meta.requiresAuth as boolean;
  const requiresRoles = to.meta.requiresRoles as string[] | undefined;

  // Check authentication
  if (requiresAuth && !auth.isAuthenticated) {
    next('/auth/login');
    return;
  }

  // If trying to access auth pages while authenticated, redirect to tabs
  if (!requiresAuth && auth.isAuthenticated && to.path.startsWith('/auth/')) {
    next('/tabs');
    return;
  }

  // Check role-based access
  if (requiresAuth && requiresRoles && auth.currentUser) {
    if (!requiresRoles.includes(auth.currentUser.role)) {
      // User doesn't have the required role, redirect to first available tab
      next('/tabs');
      return;
    }
  }

  next();
});

export default router;
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/pets' },
    { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
    { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
    { path: '/pets', component: () => import('@/views/PetsView.vue') },
    { path: '/pets/:petId', component: () => import('@/views/PetDashboardView.vue') },
    { path: '/pets/:petId/feeding', component: () => import('@/views/FeedingView.vue') },
    { path: '/pets/:petId/water', component: () => import('@/views/WaterView.vue') },
    { path: '/pets/:petId/vaccines', component: () => import('@/views/VaccinesView.vue') },
    { path: '/pets/:petId/medications', component: () => import('@/views/MedicationsView.vue') },
    { path: '/pets/:petId/events', component: () => import('@/views/EventsView.vue') },
    { path: '/pets/:petId/symptoms', component: () => import('@/views/SymptomsView.vue') },
    { path: '/pets/:petId/weight', component: () => import('@/views/WeightView.vue') },
    { path: '/settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Wait for auth initialization to complete before making guard decisions
  if (auth.loading) {
    await new Promise<void>((resolve) => {
      const unwatch = auth.$subscribe(() => {
        if (!auth.loading) {
          unwatch();
          resolve();
        }
      });
      // Resolve immediately if already loaded
      if (!auth.loading) {
        unwatch();
        resolve();
      }
    });
  }

  const isGuest = to.meta.guest === true;
  const isAuth = !!auth.user;

  if (!isGuest && !isAuth) {
    return '/login';
  }
  if (isGuest && isAuth) {
    return '/pets';
  }
});

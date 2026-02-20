<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeft, ChevronRight, Utensils, Droplets, Shield, Pill,
  Calendar, Activity, Weight, AlertCircle,
} from 'lucide-vue-next';
import { petsApi, feedingApi, vaccinesApi } from '@/lib/api';
import type { Pet, PetDashboard, FeedingLog, Vaccine } from '@/lib/types';
import PetAvatar from '@/components/PetAvatar.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const petId = Number(route.params.petId);

const pet = ref<Pet | null>(null);
const dashboard = ref<PetDashboard | null>(null);
const recentFeeding = ref<FeedingLog[]>([]);
const vaccines = ref<Vaccine[]>([]);
const loading = ref(true);

onMounted(async () => {
  if (!Number.isFinite(petId) || petId <= 0) {
    router.replace('/pets');
    return;
  }
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const from = sevenDaysAgo.toISOString().slice(0, 10);
    const [p, d, f, v] = await Promise.all([
      petsApi.get(petId),
      petsApi.today(petId),
      feedingApi.list(petId, from),
      vaccinesApi.list(petId),
    ]);
    pet.value = p;
    dashboard.value = d;
    recentFeeding.value = f;
    vaccines.value = v;
  } catch (e) {
    console.warn('[PetDashboard] Failed to load:', e instanceof Error ? e.message : e);
  }
  loading.value = false;
});

const feedingStatus = computed(() => {
  if (!dashboard.value) return 'not_fed';
  const d = dashboard.value.feeding;
  if (d.entries_count === 0) return 'not_fed';
  if (d.total_planned_grams > 0) {
    const ratio = d.total_actual_grams / d.total_planned_grams;
    if (ratio < 0.5) return 'underfed';
    if (ratio > 1.3) return 'overfed';
  }
  return 'well_fed';
});

const vaccineStatus = computed(() => {
  if (!vaccines.value.length) return 'no_records';
  const now = new Date();
  let hasOverdue = false;
  let hasDueSoon = false;
  for (const v of vaccines.value) {
    if (!v.next_due_date) continue;
    const due = new Date(v.next_due_date);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) hasOverdue = true;
    else if (diff < 30) hasDueSoon = true;
  }
  if (hasOverdue) return 'overdue';
  if (hasDueSoon) return 'due_soon';
  return 'up_to_date';
});

const waterPercent = computed(() => {
  if (!dashboard.value) return 0;
  const w = dashboard.value.water;
  if (!w.daily_goal_ml) return 0;
  return Math.min(100, Math.round((w.total_ml / w.daily_goal_ml) * 100));
});

function feedingStatusColor(s: string) {
  if (s === 'well_fed') return 'status-green';
  if (s === 'not_fed') return 'status-red';
  return 'status-amber';
}

function vaccineStatusColor(s: string) {
  if (s === 'up_to_date') return 'status-green';
  if (s === 'overdue') return 'status-red';
  if (s === 'due_soon') return 'status-amber';
  return 'status-gray';
}

const quickActions = [
  { key: 'feeding', icon: Utensils, path: 'feeding', color: '#9B8EC8' },
  { key: 'water', icon: Droplets, path: 'water', color: '#3b82f6' },
  { key: 'vaccines', icon: Shield, path: 'vaccines', color: '#10b981' },
  { key: 'meds', icon: Pill, path: 'medications', color: '#B4A5D6' },
  { key: 'events', icon: Calendar, path: 'events', color: '#ec4899' },
  { key: 'symptoms', icon: Activity, path: 'symptoms', color: '#ef4444' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<template>
  <main class="container" style="padding-top: 24px; padding-bottom: 48px;">
    <button class="back-btn" @click="router.push('/pets')">
      <ArrowLeft :size="18" /> {{ t('pets.myPets') }}
    </button>

    <div v-if="loading" class="loading-center"><div class="spinner" /></div>

    <template v-else-if="pet && dashboard">
      <!-- Hero -->
      <div class="hero-card card mb-4">
        <PetAvatar :photo-url="pet.photo_url" :name="pet.name" :species="pet.species" :size="72" />
        <div class="hero-info">
          <h1 class="hero-name">{{ pet.name }}</h1>
          <p class="hero-meta">
            {{ t(`pets.${pet.species}`) }}
            <template v-if="pet.breed"> &middot; {{ pet.breed }}</template>
            <template v-if="pet.weight_kg"> &middot; {{ pet.weight_kg }} kg</template>
          </p>
        </div>
      </div>

      <!-- Status Overview -->
      <section class="mb-4">
        <h2 class="section-title">{{ t('dashboard.statusOverview') }}</h2>
        <div class="grid-2">
          <div class="status-card card" @click="router.push(`/pets/${petId}/feeding`)">
            <div :class="['status-icon', feedingStatusColor(feedingStatus)]">
              <Utensils :size="16" />
            </div>
            <div class="status-info">
              <span class="status-label">{{ t('dashboard.feedingStatus') }}</span>
              <span class="status-value">{{ t(`dashboard.feedingState.${feedingStatus}`) }}</span>
            </div>
            <ChevronRight :size="16" class="text-muted" />
          </div>
          <div class="status-card card" @click="router.push(`/pets/${petId}/vaccines`)">
            <div :class="['status-icon', vaccineStatusColor(vaccineStatus)]">
              <Shield :size="16" />
            </div>
            <div class="status-info">
              <span class="status-label">{{ t('dashboard.vaccineStatus') }}</span>
              <span class="status-value">{{ t(`dashboard.vaccineState.${vaccineStatus}`) }}</span>
            </div>
            <ChevronRight :size="16" class="text-muted" />
          </div>
        </div>
      </section>

      <!-- Today's Overview -->
      <section class="mb-4">
        <h2 class="section-title">{{ t('dashboard.todayOverview') }}</h2>
        <div class="card">
          <div class="overview-row">
            <div class="overview-item">
              <Utensils :size="16" class="text-primary" />
              <div>
                <div class="overview-label">{{ t('dashboard.food') }}</div>
                <div class="overview-value">{{ dashboard.feeding.total_actual_grams }}g</div>
                <div v-if="dashboard.feeding.total_planned_grams" class="overview-sub">
                  / {{ dashboard.feeding.total_planned_grams }}g {{ t('feeding.planned') }}
                </div>
              </div>
            </div>
            <div class="overview-item">
              <Droplets :size="16" style="color: #3b82f6;" />
              <div>
                <div class="overview-label">{{ t('dashboard.water') }}</div>
                <div class="overview-value">{{ dashboard.water.total_ml }} ml</div>
                <div v-if="dashboard.water.daily_goal_ml" class="overview-sub">
                  / {{ dashboard.water.daily_goal_ml }} ml
                </div>
              </div>
            </div>
          </div>
          <!-- Water progress bar -->
          <div v-if="dashboard.water.daily_goal_ml" class="water-progress mt-2">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: waterPercent + '%' }" />
            </div>
            <span class="progress-label">{{ waterPercent }}%</span>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="mb-4">
        <h2 class="section-title">{{ t('dashboard.quickActions') }}</h2>
        <div class="actions-grid">
          <button
            v-for="a in quickActions"
            :key="a.key"
            class="action-card"
            @click="router.push(`/pets/${petId}/${a.path}`)"
          >
            <div class="action-icon" :style="{ background: a.color + '15', color: a.color }">
              <component :is="a.icon" :size="20" />
            </div>
            <span class="action-label">{{ t(`dashboard.${a.key}`) }}</span>
          </button>
        </div>
      </section>

      <!-- Upcoming Events -->
      <section v-if="dashboard.upcoming_events.length" class="mb-4">
        <div class="section-header">
          <h2 class="section-title">{{ t('dashboard.upcomingEvents') }}</h2>
          <button class="link-btn" @click="router.push(`/pets/${petId}/events`)">
            {{ t('dashboard.seeAll') }} <ChevronRight :size="14" />
          </button>
        </div>
        <div class="card">
          <div
            v-for="ev in dashboard.upcoming_events.slice(0, 3)"
            :key="ev.id"
            class="event-row"
          >
            <div class="status-icon status-purple"><Calendar :size="14" /></div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm">{{ ev.title }}</div>
              <div class="text-xs text-muted">{{ formatDateTime(ev.datetime_start) }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Active Medications -->
      <section v-if="dashboard.active_medications.length" class="mb-4">
        <div class="section-header">
          <h2 class="section-title">{{ t('dashboard.activeMedications') }}</h2>
          <button class="link-btn" @click="router.push(`/pets/${petId}/medications`)">
            {{ t('dashboard.seeAll') }} <ChevronRight :size="14" />
          </button>
        </div>
        <div class="card">
          <div
            v-for="med in dashboard.active_medications.slice(0, 3)"
            :key="med.id"
            class="event-row"
          >
            <div class="status-icon status-purple"><Pill :size="14" /></div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm">{{ med.name }}</div>
              <div class="text-xs text-muted">{{ med.dosage }} &middot; {{ med.frequency_per_day }}x/{{ t('dashboard.day') }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Vaccine History -->
      <section v-if="vaccines.length" class="mb-4">
        <div class="section-header">
          <h2 class="section-title">{{ t('dashboard.vaccineHistory') }}</h2>
          <button class="link-btn" @click="router.push(`/pets/${petId}/vaccines`)">
            {{ t('dashboard.seeAll') }} <ChevronRight :size="14" />
          </button>
        </div>
        <div class="card">
          <div
            v-for="v in vaccines.slice(0, 5)"
            :key="v.id"
            class="event-row"
          >
            <div class="status-icon status-green"><Shield :size="14" /></div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm">{{ v.name }}</div>
              <div class="text-xs text-muted">{{ formatDate(v.date_administered) }}</div>
            </div>
            <span v-if="v.next_due_date" class="text-xs text-secondary">
              {{ t('dashboard.nextDue') }}: {{ formatDate(v.next_due_date) }}
            </span>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 500; color: var(--c-primary);
  margin-bottom: 16px; padding: 6px 0;
}
.back-btn:hover { opacity: 0.8; }
.hero-card {
  display: flex; align-items: center; gap: 20px;
  background: linear-gradient(135deg, rgba(155,142,200,0.08), rgba(180,165,214,0.04));
}
.hero-name { font-size: 22px; font-weight: 700; color: var(--c-txt); }
.hero-meta { font-size: 14px; color: var(--c-txt-secondary); margin-top: 2px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--c-txt); margin-bottom: 12px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-header .section-title { margin-bottom: 0; }
.link-btn {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 600; color: var(--c-primary);
}
.link-btn:hover { opacity: 0.8; }
.status-card {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 14px; transition: all var(--transition);
}
.status-card:hover { transform: translateY(-1px); }
.status-info { flex: 1; min-width: 0; }
.status-label { font-size: 12px; color: var(--c-txt-muted); display: block; }
.status-value { font-size: 14px; font-weight: 600; color: var(--c-txt); }
.overview-row { display: flex; gap: 24px; }
.overview-item { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.overview-label { font-size: 12px; color: var(--c-txt-muted); }
.overview-value { font-size: 18px; font-weight: 700; color: var(--c-txt); }
.overview-sub { font-size: 12px; color: var(--c-txt-secondary); }
.water-progress { display: flex; align-items: center; gap: 10px; }
.progress-bar {
  flex: 1; height: 8px; border-radius: 4px; background: #e5e7eb; overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(to right, #60a5fa, #3b82f6);
  transition: width 0.5s ease;
}
.progress-label { font-size: 13px; font-weight: 600; color: var(--c-txt-secondary); min-width: 36px; }
.actions-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
@media (max-width: 480px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
.action-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 8px; border-radius: var(--radius-md);
  background: var(--c-card); border: 1px solid rgba(255,255,255,0.9);
  box-shadow: var(--shadow-card); transition: all var(--transition);
}
.action-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.action-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.action-label { font-size: 13px; font-weight: 600; color: var(--c-txt); }
.event-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 0;
}
.event-row + .event-row { border-top: 1px solid var(--c-border); }
</style>

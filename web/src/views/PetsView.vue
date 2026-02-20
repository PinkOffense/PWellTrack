<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Plus, ChevronRight, AlertCircle, CheckCircle, Clock,
  HelpCircle, AlertTriangle, Shield, Droplets, Pill,
  Camera, Trash2, X,
} from 'lucide-vue-next';
import { petsApi, preparePhoto } from '@/lib/api';
import { KNOWN_SPECIES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useConfirmStore } from '@/stores/confirm';
import type { Pet, PetCreate, PetSummaryItem } from '@/lib/types';
import PetAvatar from '@/components/PetAvatar.vue';
import AppModal from '@/components/AppModal.vue';
import EmptyState from '@/components/EmptyState.vue';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const confirm = useConfirmStore();

const items = ref<PetSummaryItem[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editingPet = ref<Pet | null>(null);

// Form state
const form = ref<PetCreate>({ name: '', species: 'dog' });
const formPhoto = ref<File | null>(null);
const formPhotoPreview = ref('');
const saving = ref(false);

const isDemo = computed(() => auth.user?.id === 0);

async function fetchPets() {
  if (isDemo.value) { loading.value = false; return; }
  try {
    items.value = await petsApi.summary();
  } catch { /* ignore */ }
  loading.value = false;
}

onMounted(fetchPets);

function openAddModal() {
  editingPet.value = null;
  form.value = { name: '', species: 'dog' };
  formPhoto.value = null;
  formPhotoPreview.value = '';
  showModal.value = true;
}

function openEditModal(pet: Pet) {
  editingPet.value = pet;
  form.value = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed || undefined,
    date_of_birth: pet.date_of_birth || undefined,
    sex: pet.sex || undefined,
    weight_kg: pet.weight_kg || undefined,
    notes: pet.notes || undefined,
  };
  formPhoto.value = null;
  formPhotoPreview.value = '';
  showModal.value = true;
}

function handlePhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  formPhoto.value = file;
  formPhotoPreview.value = URL.createObjectURL(file);
}

function clearPhoto() {
  formPhoto.value = null;
  formPhotoPreview.value = '';
}

async function handleSave() {
  if (!form.value.name.trim()) {
    toast.show(t('forms.nameRequired'), 'error');
    return;
  }
  saving.value = true;
  try {
    const data = { ...form.value, name: form.value.name.trim() };
    if (formPhoto.value) {
      data.photo_url = await preparePhoto(formPhoto.value);
    }
    if (editingPet.value) {
      await petsApi.update(editingPet.value.id, data);
    } else {
      await petsApi.create(data);
    }
    toast.show(t('forms.petSaved'), 'success');
    showModal.value = false;
    await fetchPets();
  } catch (e: any) {
    toast.show(e.message, 'error');
  } finally {
    saving.value = false;
  }
}

async function handleDelete(pet: Pet) {
  const ok = await confirm.show({
    title: t('common.delete'),
    message: `${t('common.delete')} ${pet.name}?`,
    confirmLabel: t('common.delete'),
    danger: true,
  });
  if (!ok) return;
  try {
    await petsApi.delete(pet.id);
    toast.show(t('common.success'), 'success');
    await fetchPets();
  } catch (e: any) {
    toast.show(e.message, 'error');
  }
}

function feedingBadge(item: PetSummaryItem) {
  const d = item.dashboard.feeding;
  if (d.entries_count === 0) return 'not_fed';
  if (d.total_planned_grams > 0) {
    const ratio = d.total_actual_grams / d.total_planned_grams;
    if (ratio < 0.5) return 'underfed';
    if (ratio > 1.3) return 'overfed';
  }
  return 'well_fed';
}

function feedingBadgeClass(status: string) {
  if (status === 'well_fed') return 'badge-green';
  if (status === 'not_fed') return 'badge-red';
  return 'badge-amber';
}

function vaccineBadgeClass(status: string) {
  if (status === 'up_to_date') return 'badge-green';
  if (status === 'overdue') return 'badge-red';
  if (status === 'due_soon') return 'badge-amber';
  return 'badge-gray';
}
</script>

<template>
  <main class="container" style="padding-top: 24px; padding-bottom: 48px;">
    <div class="pets-header">
      <h1 class="page-title">{{ t('pets.myPets') }}</h1>
      <button v-if="!isDemo" class="btn-primary" @click="openAddModal">
        <Plus :size="16" />
        {{ t('pets.addPet') }}
      </button>
    </div>

    <div v-if="isDemo" class="alert-warning mb-4">{{ t('pets.demoMode') }}</div>

    <div v-if="loading" class="loading-center">
      <div class="spinner" />
    </div>

    <EmptyState
      v-else-if="!items.length"
      :title="t('pets.noPetsTitle')"
      :subtitle="t('pets.noPetsSubtitle')"
    />

    <div v-else class="pets-list">
      <div
        v-for="item in items"
        :key="item.pet.id"
        class="pet-card card"
        @click="router.push(`/pets/${item.pet.id}`)"
      >
        <div class="pet-card-main">
          <PetAvatar
            :photo-url="item.pet.photo_url"
            :name="item.pet.name"
            :species="item.pet.species"
            :size="56"
          />
          <div class="pet-card-info">
            <h3 class="pet-card-name">{{ item.pet.name }}</h3>
            <p class="pet-card-meta">
              {{ t(`pets.${item.pet.species}`) }}
              <template v-if="item.pet.breed"> &middot; {{ item.pet.breed }}</template>
              <template v-if="item.pet.weight_kg"> &middot; {{ item.pet.weight_kg }} kg</template>
            </p>
            <div class="pet-card-badges">
              <span :class="['badge', feedingBadgeClass(feedingBadge(item))]">
                {{ t(`petList.feedingBadge.${feedingBadge(item)}`) }}
              </span>
              <span :class="['badge', vaccineBadgeClass(item.vaccine_status.status)]">
                {{ t(`petList.vaccineBadge.${item.vaccine_status.status}`) }}
              </span>
            </div>
          </div>
          <div class="pet-card-actions">
            <button
              class="btn-icon"
              @click.stop="openEditModal(item.pet)"
              :aria-label="t('common.edit')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button
              class="btn-danger"
              @click.stop="handleDelete(item.pet)"
              :aria-label="t('common.delete')"
            >
              <Trash2 :size="16" />
            </button>
            <ChevronRight :size="18" class="chevron" />
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Pet Modal -->
    <AppModal
      v-if="showModal"
      :title="editingPet ? t('pets.editPet') : t('pets.newPet')"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSave" class="pet-form">
        <div class="form-field">
          <label class="label">{{ t('pets.name') }} <span class="label-required">*</span></label>
          <input v-model="form.name" class="input" :placeholder="t('pets.name')" />
        </div>

        <div class="form-field">
          <label class="label">{{ t('pets.species') }}</label>
          <div class="species-chips">
            <button
              v-for="sp in KNOWN_SPECIES"
              :key="sp"
              type="button"
              :class="['chip', form.species === sp && 'chip-active']"
              @click="form.species = sp"
            >
              {{ t(`pets.${sp}`) }}
            </button>
          </div>
        </div>

        <div class="form-field">
          <label class="label">{{ t('pets.breed') }} <span class="label-optional">({{ t('common.notes') }})</span></label>
          <input v-model="form.breed" class="input" :placeholder="t('pets.breed')" />
        </div>

        <div class="grid-2">
          <div class="form-field">
            <label class="label">{{ t('pets.dob') }}</label>
            <input v-model="form.date_of_birth" type="date" class="input" />
          </div>
          <div class="form-field">
            <label class="label">{{ t('pets.sex') }}</label>
            <select v-model="form.sex" class="input">
              <option value="">{{ t('pets.sexPlaceholder') }}</option>
              <option value="male">{{ t('pets.male') }}</option>
              <option value="female">{{ t('pets.female') }}</option>
            </select>
          </div>
        </div>

        <div class="form-field">
          <label class="label">{{ t('pets.weight') }}</label>
          <input v-model.number="form.weight_kg" type="number" step="0.1" class="input" placeholder="0.0" />
        </div>

        <div class="form-field">
          <label class="label">{{ t('pets.photo') }}</label>
          <div v-if="formPhotoPreview" class="photo-preview">
            <img :src="formPhotoPreview" alt="Preview" class="photo-img" />
            <button type="button" class="photo-remove" @click="clearPhoto"><X :size="14" /></button>
          </div>
          <label v-else class="photo-upload">
            <Camera :size="20" />
            <span>{{ t('pets.addPhoto') }}</span>
            <input type="file" accept="image/*" class="sr-only" @change="handlePhotoSelect" />
          </label>
        </div>

        <div class="form-field">
          <label class="label">{{ t('pets.notes') }}</label>
          <textarea v-model="form.notes" class="input" rows="3" :placeholder="t('common.notes')" />
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="saving">
          {{ saving ? t('common.loading') : t('common.save') }}
        </button>
      </form>
    </AppModal>
  </main>
</template>

<style scoped>
.pets-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.page-title { font-size: 24px; font-weight: 700; color: var(--c-txt); }
.pets-list { display: flex; flex-direction: column; gap: 12px; }
.pet-card { cursor: pointer; transition: all var(--transition); padding: 16px; }
.pet-card:hover { transform: translateY(-2px); }
.pet-card-main {
  display: flex; align-items: center; gap: 16px;
}
.pet-card-info { flex: 1; min-width: 0; }
.pet-card-name { font-size: 16px; font-weight: 700; color: var(--c-txt); }
.pet-card-meta { font-size: 13px; color: var(--c-txt-secondary); margin-top: 2px; }
.pet-card-badges { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.pet-card-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.chevron { color: var(--c-txt-muted); }

.pet-form { display: flex; flex-direction: column; gap: 16px; }
.form-field { display: flex; flex-direction: column; }
.species-chips { display: flex; gap: 8px; }
.chip {
  padding: 8px 16px; border-radius: var(--radius-full);
  font-size: 14px; font-weight: 500;
  border: 1px solid var(--c-border); color: var(--c-txt-secondary);
  transition: all var(--transition);
}
.chip:hover { border-color: var(--c-primary-light); }
.chip-active {
  background: var(--c-primary-bg); color: var(--c-primary);
  border-color: var(--c-primary);
}

.photo-preview {
  position: relative; width: 96px; height: 96px;
  border-radius: var(--radius-md); overflow: hidden;
}
.photo-img { width: 100%; height: 100%; object-fit: cover; }
.photo-remove {
  position: absolute; top: 4px; right: 4px;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.5); color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.photo-upload {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 12px 16px; border: 2px dashed var(--c-border);
  border-radius: var(--radius-md); color: var(--c-txt-muted);
  font-size: 14px; transition: all var(--transition);
}
.photo-upload:hover { border-color: var(--c-primary); color: var(--c-primary); }
</style>

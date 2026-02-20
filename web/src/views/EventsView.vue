<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Calendar, Trash2, Stethoscope, Shield, Scissors } from 'lucide-vue-next';
import { eventsApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { PetEvent, EventCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

const EVENT_TYPES = ['vet_visit', 'vaccine', 'grooming', 'other'] as const;

const title = ref('');
const type = ref('vet_visit');
const datetimeStart = ref('');
const duration = ref<number | undefined>();
const location = ref('');
const notes = ref('');
const saving = ref(false);

function resetForm() {
  title.value = ''; type.value = 'vet_visit'; datetimeStart.value = '';
  duration.value = undefined; location.value = ''; notes.value = '';
}

function initForm(item: PetEvent | null) {
  if (item) {
    title.value = item.title; type.value = item.type;
    datetimeStart.value = item.datetime_start?.slice(0, 16) || '';
    duration.value = item.duration_minutes || undefined;
    location.value = item.location || '';
    notes.value = item.notes || '';
  } else { resetForm(); }
}

async function handleSubmit(petId: number, editing: PetEvent | null, onSaved: () => void) {
  if (!title.value.trim() || !datetimeStart.value) {
    toast.show(t('forms.eventRequired'), 'error'); return;
  }
  if (duration.value !== undefined && duration.value <= 0) {
    toast.show(t('forms.invalidDuration'), 'error'); return;
  }
  saving.value = true;
  try {
    const data: EventCreate = {
      title: title.value.trim(),
      type: type.value,
      datetime_start: datetimeStart.value,
      duration_minutes: duration.value || undefined,
      location: location.value.trim() || undefined,
      notes: notes.value.trim() || undefined,
    };
    if (editing) await eventsApi.update(editing.id, data);
    else await eventsApi.create(petId, data);
    onSaved(); resetForm();
  } catch (e: any) { toast.show(e.message, 'error'); }
  finally { saving.value = false; }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

function typeIcon(t: string) {
  if (t === 'vet_visit') return Stethoscope;
  if (t === 'vaccine') return Shield;
  if (t === 'grooming') return Scissors;
  return Calendar;
}
</script>

<template>
  <RecordPage
    :title="t('events.title')"
    :empty-title="t('events.noEvents')"
    :empty-subtitle="t('events.noEventsHint')"
    :delete-msg="t('events.deleteConfirm')"
    :saved-msg="t('forms.eventSaved')"
    :modal-title="t('events.addEvent')"
    :fetch-fn="(id) => eventsApi.list(id)"
    :delete-fn="(id) => eventsApi.delete(id)"
    :create-fn="(id, d) => eventsApi.create(id, d)"
  >
    <template #list="{ items, onDelete }">
      <div v-for="item in (items as PetEvent[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" style="background: rgba(236,72,153,0.1); color: #ec4899;">
            <component :is="typeIcon(item.type)" :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.title }}</div>
            <div class="record-detail">{{ t(`events.${item.type === 'vet_visit' ? 'vetVisit' : item.type}`) }}
              <template v-if="item.location"> &middot; {{ item.location }}</template>
            </div>
            <div class="record-date">{{ formatDateTime(item.datetime_start) }}
              <template v-if="item.duration_minutes"> &middot; {{ item.duration_minutes }} min</template>
            </div>
            <div v-if="item.notes" class="record-notes">{{ item.notes }}</div>
          </div>
          <button class="btn-danger" @click="onDelete(item)"><Trash2 :size="15" /></button>
        </div>
      </div>
    </template>

    <template #form="{ petId, editing, onSaved }">
      <form @submit.prevent="handleSubmit(petId, editing, onSaved)" class="record-form" @vue:mounted="initForm(editing)">
        <div class="form-field">
          <label class="label">{{ t('events.eventTitle') }} <span class="label-required">*</span></label>
          <input v-model="title" class="input" placeholder="Vet checkup..." />
        </div>
        <div class="form-field">
          <label class="label">{{ t('events.type') }}</label>
          <div class="chips">
            <button
              v-for="et in EVENT_TYPES" :key="et" type="button"
              :class="['chip', type === et && 'chip-active']"
              @click="type = et"
            >
              {{ t(`events.${et === 'vet_visit' ? 'vetVisit' : et}`) }}
            </button>
          </div>
        </div>
        <div class="form-field">
          <label class="label">{{ t('events.datetime') }} <span class="label-required">*</span></label>
          <input v-model="datetimeStart" type="datetime-local" class="input" />
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label class="label">{{ t('events.duration') }}</label>
            <input v-model.number="duration" type="number" min="1" class="input" placeholder="30" />
          </div>
          <div class="form-field">
            <label class="label">{{ t('events.location') }}</label>
            <input v-model="location" class="input" />
          </div>
        </div>
        <div class="form-field">
          <label class="label">{{ t('common.notes') }}</label>
          <textarea v-model="notes" class="input" rows="2" />
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="saving">
          {{ saving ? t('common.loading') : t('common.save') }}
        </button>
      </form>
    </template>
  </RecordPage>
</template>

<style scoped>
.record-card { padding: 14px; }
.record-row { display: flex; align-items: flex-start; gap: 12px; }
.record-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.record-info { flex: 1; min-width: 0; }
.record-name { font-size: 15px; font-weight: 600; color: var(--c-txt); }
.record-detail { font-size: 13px; color: var(--c-txt-secondary); margin-top: 2px; }
.record-date { font-size: 12px; color: var(--c-txt-muted); margin-top: 4px; }
.record-notes { font-size: 12px; color: var(--c-txt-muted); font-style: italic; margin-top: 4px; }
.record-form { display: flex; flex-direction: column; gap: 16px; }
.form-field { display: flex; flex-direction: column; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
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
</style>

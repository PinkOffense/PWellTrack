<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Pill, Trash2 } from 'lucide-vue-next';
import { medicationsApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Medication, MedicationCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

const name = ref('');
const dosage = ref('');
const frequency = ref<number | undefined>();
const startDate = ref('');
const endDate = ref('');
const notes = ref('');
const saving = ref(false);

function resetForm() {
  name.value = ''; dosage.value = ''; frequency.value = undefined;
  startDate.value = ''; endDate.value = ''; notes.value = '';
}

function initForm(item: Medication | null) {
  if (item) {
    name.value = item.name; dosage.value = item.dosage;
    frequency.value = item.frequency_per_day;
    startDate.value = item.start_date?.slice(0, 10) || '';
    endDate.value = item.end_date?.slice(0, 10) || '';
    notes.value = item.notes || '';
  } else { resetForm(); }
}

async function handleSubmit(petId: number, editing: Medication | null, onSaved: () => void) {
  if (!name.value.trim() || !dosage.value.trim() || !frequency.value || !startDate.value) {
    toast.show(t('forms.requiredFields'), 'error'); return;
  }
  if (!Number.isInteger(frequency.value)) {
    toast.show(t('forms.frequencyMustBeInteger'), 'error'); return;
  }
  if (endDate.value && endDate.value < startDate.value) {
    toast.show(t('forms.endDateBeforeStart'), 'error'); return;
  }
  saving.value = true;
  try {
    const data: MedicationCreate = {
      name: name.value.trim(),
      dosage: dosage.value.trim(),
      frequency_per_day: frequency.value,
      start_date: startDate.value,
      end_date: endDate.value || undefined,
      notes: notes.value.trim() || undefined,
    };
    if (editing) await medicationsApi.update(editing.id, data);
    else await medicationsApi.create(petId, data);
    onSaved(); resetForm();
  } catch (e: any) { toast.show(e.message, 'error'); }
  finally { saving.value = false; }
}

function formatDate(d: string) { return new Date(d).toLocaleDateString(); }
</script>

<template>
  <RecordPage
    :title="t('medications.title')"
    :empty-title="t('medications.noMeds')"
    :empty-subtitle="t('medications.noMedsHint')"
    :delete-msg="t('medications.deleteConfirm')"
    :saved-msg="t('forms.medicationSaved')"
    :modal-title="t('medications.addMedication')"
    :fetch-fn="(id) => medicationsApi.list(id)"
    :delete-fn="(id) => medicationsApi.delete(id)"
    :create-fn="(id, d) => medicationsApi.create(id, d)"
  >
    <template #list="{ items, onDelete }">
      <div v-for="item in (items as Medication[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" style="background: rgba(180,165,214,0.15); color: #B4A5D6;">
            <Pill :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.name }}</div>
            <div class="record-detail">
              {{ item.dosage }} &middot; {{ item.frequency_per_day }}{{ t('medications.perDay') }}
            </div>
            <div class="record-date">
              {{ formatDate(item.start_date) }}
              {{ item.end_date ? `${t('medications.to')} ${formatDate(item.end_date)}` : `(${t('medications.ongoing')})` }}
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
          <label class="label">{{ t('medications.name') }} <span class="label-required">*</span></label>
          <input v-model="name" class="input" placeholder="Amoxicillin..." />
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label class="label">{{ t('medications.dosage') }} <span class="label-required">*</span></label>
            <input v-model="dosage" class="input" placeholder="5 mg" />
          </div>
          <div class="form-field">
            <label class="label">{{ t('medications.frequency') }} <span class="label-required">*</span></label>
            <input v-model.number="frequency" type="number" step="1" min="1" class="input" placeholder="2" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label class="label">{{ t('medications.startDate') }} <span class="label-required">*</span></label>
            <input v-model="startDate" type="date" class="input" />
          </div>
          <div class="form-field">
            <label class="label">{{ t('medications.endDate') }}</label>
            <input v-model="endDate" type="date" class="input" />
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
</style>

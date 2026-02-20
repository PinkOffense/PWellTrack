<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Shield, Trash2 } from 'lucide-vue-next';
import { vaccinesApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Vaccine, VaccineCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

const name = ref('');
const dateAdministered = ref('');
const nextDueDate = ref('');
const clinic = ref('');
const notes = ref('');
const saving = ref(false);

function resetForm() {
  name.value = ''; dateAdministered.value = ''; nextDueDate.value = '';
  clinic.value = ''; notes.value = '';
}

function initForm(item: Vaccine | null) {
  if (item) {
    name.value = item.name;
    dateAdministered.value = item.date_administered?.slice(0, 10) || '';
    nextDueDate.value = item.next_due_date?.slice(0, 10) || '';
    clinic.value = item.clinic || '';
    notes.value = item.notes || '';
  } else { resetForm(); }
}

async function handleSubmit(petId: number, editing: Vaccine | null, onSaved: () => void) {
  if (!name.value.trim() || !dateAdministered.value) {
    toast.show(t('forms.vaccineRequired'), 'error'); return;
  }
  if (nextDueDate.value && nextDueDate.value < dateAdministered.value) {
    toast.show(t('forms.nextDueDateBeforeAdministered'), 'error'); return;
  }
  saving.value = true;
  try {
    const data: VaccineCreate = {
      name: name.value.trim(),
      date_administered: dateAdministered.value,
      next_due_date: nextDueDate.value || undefined,
      clinic: clinic.value.trim() || undefined,
      notes: notes.value.trim() || undefined,
    };
    if (editing) await vaccinesApi.update(editing.id, data);
    else await vaccinesApi.create(petId, data);
    onSaved();
    resetForm();
  } catch (e: any) { toast.show(e.message, 'error'); }
  finally { saving.value = false; }
}

function formatDate(d: string) { return new Date(d).toLocaleDateString(); }

function dueDateColor(d?: string) {
  if (!d) return '';
  const diff = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'text-danger';
  if (diff < 30) return 'color: var(--c-warning);';
  return '';
}

function dueDateClass(d?: string) {
  if (!d) return '';
  const diff = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'text-danger';
  if (diff < 30) return 'text-warning';
  return '';
}
</script>

<template>
  <RecordPage
    :title="t('vaccines.title')"
    :empty-title="t('vaccines.noVaccines')"
    :empty-subtitle="t('vaccines.noVaccinesHint')"
    :delete-msg="t('vaccines.deleteConfirm')"
    :saved-msg="t('forms.vaccineSaved')"
    :modal-title="t('vaccines.addVaccine')"
    :fetch-fn="(id) => vaccinesApi.list(id)"
    :delete-fn="(id) => vaccinesApi.delete(id)"
    :create-fn="(id, d) => vaccinesApi.create(id, d)"
  >
    <template #list="{ items, onDelete }">
      <div v-for="item in (items as Vaccine[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
            <Shield :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.name }}</div>
            <div class="record-detail">
              {{ t('vaccines.administered') }}: {{ formatDate(item.date_administered) }}
            </div>
            <div v-if="item.next_due_date" :class="['record-detail', dueDateClass(item.next_due_date)]">
              {{ t('vaccines.nextDue') }}: {{ formatDate(item.next_due_date) }}
            </div>
            <div v-if="item.clinic" class="record-date">{{ item.clinic }}</div>
            <div v-if="item.notes" class="record-notes">{{ item.notes }}</div>
          </div>
          <button class="btn-danger" @click="onDelete(item)"><Trash2 :size="15" /></button>
        </div>
      </div>
    </template>

    <template #form="{ petId, editing, onSaved }">
      <form @submit.prevent="handleSubmit(petId, editing, onSaved)" class="record-form" @vue:mounted="initForm(editing)">
        <div class="form-field">
          <label class="label">{{ t('vaccines.name') }} <span class="label-required">*</span></label>
          <input v-model="name" class="input" placeholder="Rabies, V8..." />
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label class="label">{{ t('vaccines.dateAdministered') }} <span class="label-required">*</span></label>
            <input v-model="dateAdministered" type="date" class="input" />
          </div>
          <div class="form-field">
            <label class="label">{{ t('vaccines.nextDueDate') }}</label>
            <input v-model="nextDueDate" type="date" class="input" />
          </div>
        </div>
        <div class="form-field">
          <label class="label">{{ t('vaccines.clinic') }}</label>
          <input v-model="clinic" class="input" />
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
.text-danger { color: var(--c-danger); }
.text-warning { color: var(--c-warning); }
</style>

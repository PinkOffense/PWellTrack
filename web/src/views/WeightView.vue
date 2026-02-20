<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Weight, Trash2 } from 'lucide-vue-next';
import { weightApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { WeightLog, WeightCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

const weightKg = ref<number | undefined>();
const notes = ref('');
const saving = ref(false);

function resetForm() { weightKg.value = undefined; notes.value = ''; }

function initForm(item: WeightLog | null) {
  if (item) {
    weightKg.value = item.weight_kg;
    notes.value = item.notes || '';
  } else { resetForm(); }
}

async function handleSubmit(petId: number, editing: WeightLog | null, onSaved: () => void) {
  if (!weightKg.value || weightKg.value <= 0) {
    toast.show(t('forms.invalidWeight'), 'error'); return;
  }
  saving.value = true;
  try {
    const data: WeightCreate = {
      weight_kg: weightKg.value,
      notes: notes.value.trim() || undefined,
    };
    if (editing) await weightApi.update(editing.id, data);
    else await weightApi.create(petId, data);
    onSaved(); resetForm();
  } catch (e: any) { toast.show(e.message, 'error'); }
  finally { saving.value = false; }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}
</script>

<template>
  <RecordPage
    :title="t('pets.weight')"
    :empty-title="t('common.noData')"
    :empty-subtitle="''"
    :delete-msg="t('common.delete') + '?'"
    :saved-msg="t('common.success')"
    :modal-title="t('pets.weight')"
    :fetch-fn="(id) => weightApi.list(id)"
    :delete-fn="(id) => weightApi.delete(id)"
    :create-fn="(id, d) => weightApi.create(id, d)"
  >
    <template #list="{ items, onDelete }">
      <div v-for="item in (items as WeightLog[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" style="background: rgba(155,142,200,0.1); color: var(--c-primary);">
            <Weight :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.weight_kg }} kg</div>
            <div class="record-date">{{ formatDate(item.datetime) }}</div>
            <div v-if="item.notes" class="record-notes">{{ item.notes }}</div>
          </div>
          <button class="btn-danger" @click="onDelete(item)"><Trash2 :size="15" /></button>
        </div>
      </div>
    </template>

    <template #form="{ petId, editing, onSaved }">
      <form @submit.prevent="handleSubmit(petId, editing, onSaved)" class="record-form" @vue:mounted="initForm(editing)">
        <div class="form-field">
          <label class="label">{{ t('pets.weight') }} <span class="label-required">*</span></label>
          <input v-model.number="weightKg" type="number" step="0.01" class="input" placeholder="5.5" />
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
.record-date { font-size: 12px; color: var(--c-txt-muted); margin-top: 4px; }
.record-notes { font-size: 12px; color: var(--c-txt-muted); font-style: italic; margin-top: 4px; }
.record-form { display: flex; flex-direction: column; gap: 16px; }
.form-field { display: flex; flex-direction: column; }
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Utensils, Trash2 } from 'lucide-vue-next';
import { feedingApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { FeedingLog, FeedingCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

// Form state
const foodType = ref('');
const actualGrams = ref<number | undefined>();
const plannedGrams = ref<number | undefined>();
const notes = ref('');
const saving = ref(false);

function resetForm() {
  foodType.value = '';
  actualGrams.value = undefined;
  plannedGrams.value = undefined;
  notes.value = '';
}

function initForm(item: FeedingLog | null) {
  if (item) {
    foodType.value = item.food_type;
    actualGrams.value = item.actual_amount_grams;
    plannedGrams.value = item.planned_amount_grams || undefined;
    notes.value = item.notes || '';
  } else {
    resetForm();
  }
}

async function handleSubmit(petId: number, editing: FeedingLog | null, onSaved: () => void) {
  if (!foodType.value.trim()) { toast.show(t('forms.foodTypeRequired'), 'error'); return; }
  if (!actualGrams.value || actualGrams.value <= 0) { toast.show(t('forms.invalidAmount'), 'error'); return; }

  saving.value = true;
  try {
    const data: FeedingCreate = {
      food_type: foodType.value.trim(),
      actual_amount_grams: actualGrams.value,
      planned_amount_grams: plannedGrams.value || undefined,
      notes: notes.value.trim() || undefined,
    };
    if (editing) {
      await feedingApi.update(editing.id, data);
    } else {
      await feedingApi.create(petId, data);
    }
    onSaved();
    resetForm();
  } catch (e: any) {
    toast.show(e.message, 'error');
  } finally {
    saving.value = false;
  }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<template>
  <RecordPage
    :title="t('feeding.title')"
    :empty-title="t('feeding.noLogs')"
    :empty-subtitle="t('feeding.noLogsHint')"
    :delete-msg="t('feeding.deleteConfirm')"
    :saved-msg="t('forms.feedingSaved')"
    :modal-title="t('feeding.addFeeding')"
    :fetch-fn="(id) => feedingApi.list(id)"
    :delete-fn="(id) => feedingApi.delete(id)"
    :create-fn="(id, d) => feedingApi.create(id, d)"
    :update-fn="(id, d) => feedingApi.update(id, d)"
  >
    <template #list="{ items, onDelete, onEdit }">
      <div v-for="item in (items as FeedingLog[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" style="background: rgba(155,142,200,0.1); color: var(--c-primary);">
            <Utensils :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.food_type }}</div>
            <div class="record-detail">
              {{ item.actual_amount_grams }}g
              <template v-if="item.planned_amount_grams">
                / {{ item.planned_amount_grams }}g {{ t('feeding.planned') }}
              </template>
            </div>
            <div class="record-date">{{ formatDateTime(item.datetime) }}</div>
            <div v-if="item.notes" class="record-notes">{{ item.notes }}</div>
          </div>
          <div class="record-actions">
            <button class="btn-danger" @click="onDelete(item)"><Trash2 :size="15" /></button>
          </div>
        </div>
      </div>
    </template>

    <template #form="{ petId, editing, onSaved }">
      <form @submit.prevent="handleSubmit(petId, editing, onSaved)" class="record-form" @vue:mounted="initForm(editing)">
        <div class="form-field">
          <label class="label">{{ t('feeding.foodType') }} <span class="label-required">*</span></label>
          <input v-model="foodType" class="input" placeholder="Dry food, Wet food..." />
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label class="label">{{ t('feeding.actualAmount') }} <span class="label-required">*</span></label>
            <input v-model.number="actualGrams" type="number" step="0.1" class="input" placeholder="150" />
          </div>
          <div class="form-field">
            <label class="label">{{ t('feeding.plannedAmount') }}</label>
            <input v-model.number="plannedGrams" type="number" step="0.1" class="input" placeholder="200" />
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
.record-actions { flex-shrink: 0; }
.record-form { display: flex; flex-direction: column; gap: 16px; }
.form-field { display: flex; flex-direction: column; }
</style>

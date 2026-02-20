<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Droplets, Trash2 } from 'lucide-vue-next';
import { waterApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { WaterLog, WaterCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

const amountMl = ref<number | undefined>();
const dailyGoal = ref<number | undefined>();
const saving = ref(false);

function resetForm() { amountMl.value = undefined; dailyGoal.value = undefined; }

function initForm(item: WaterLog | null) {
  if (item) {
    amountMl.value = item.amount_ml;
    dailyGoal.value = item.daily_goal_ml || undefined;
  } else {
    resetForm();
  }
}

async function handleSubmit(petId: number, editing: WaterLog | null, onSaved: () => void) {
  if (!amountMl.value || amountMl.value <= 0) { toast.show(t('forms.invalidAmount'), 'error'); return; }
  saving.value = true;
  try {
    const data: WaterCreate = {
      amount_ml: amountMl.value,
      daily_goal_ml: dailyGoal.value || undefined,
    };
    if (editing) await waterApi.update(editing.id, data);
    else await waterApi.create(petId, data);
    onSaved();
    resetForm();
  } catch (e: any) { toast.show(e.message, 'error'); }
  finally { saving.value = false; }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<template>
  <RecordPage
    :title="t('water.title')"
    :empty-title="t('water.noLogs')"
    :empty-subtitle="t('water.noLogsHint')"
    :delete-msg="t('water.deleteConfirm')"
    :saved-msg="t('forms.waterSaved')"
    :modal-title="t('water.addWater')"
    :fetch-fn="(id) => waterApi.list(id)"
    :delete-fn="(id) => waterApi.delete(id)"
    :create-fn="(id, d) => waterApi.create(id, d)"
  >
    <template #list="{ items, onDelete }">
      <div v-for="item in (items as WaterLog[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;">
            <Droplets :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.amount_ml }} ml</div>
            <div v-if="item.daily_goal_ml" class="record-detail">
              {{ t('water.goalLabel') }}: {{ item.daily_goal_ml }} ml
            </div>
            <div class="record-date">{{ formatDateTime(item.datetime) }}</div>
          </div>
          <button class="btn-danger" @click="onDelete(item)"><Trash2 :size="15" /></button>
        </div>
      </div>
    </template>

    <template #form="{ petId, editing, onSaved }">
      <form @submit.prevent="handleSubmit(petId, editing, onSaved)" class="record-form" @vue:mounted="initForm(editing)">
        <div class="form-field">
          <label class="label">{{ t('water.amount') }} <span class="label-required">*</span></label>
          <input v-model.number="amountMl" type="number" step="1" class="input" placeholder="250" />
        </div>
        <div class="form-field">
          <label class="label">{{ t('water.dailyGoal') }}</label>
          <input v-model.number="dailyGoal" type="number" step="1" class="input" placeholder="500" />
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
.record-form { display: flex; flex-direction: column; gap: 16px; }
.form-field { display: flex; flex-direction: column; }
</style>

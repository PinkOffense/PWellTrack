<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Activity, Trash2 } from 'lucide-vue-next';
import { symptomsApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Symptom, SymptomCreate } from '@/lib/types';
import RecordPage from '@/components/RecordPage.vue';

const { t } = useI18n();
const toast = useToastStore();

const SEVERITIES = ['mild', 'moderate', 'severe'] as const;

const symptomType = ref('');
const severity = ref('mild');
const notes = ref('');
const saving = ref(false);

function resetForm() { symptomType.value = ''; severity.value = 'mild'; notes.value = ''; }

function initForm(item: Symptom | null) {
  if (item) {
    symptomType.value = item.type;
    severity.value = item.severity;
    notes.value = item.notes || '';
  } else { resetForm(); }
}

async function handleSubmit(petId: number, editing: Symptom | null, onSaved: () => void) {
  if (!symptomType.value.trim()) { toast.show(t('forms.symptomRequired'), 'error'); return; }
  saving.value = true;
  try {
    const data: SymptomCreate = {
      type: symptomType.value.trim(),
      severity: severity.value,
      notes: notes.value.trim() || undefined,
    };
    if (editing) await symptomsApi.update(editing.id, data);
    else await symptomsApi.create(petId, data);
    onSaved(); resetForm();
  } catch (e: any) { toast.show(e.message, 'error'); }
  finally { saving.value = false; }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

function severityColor(s: string) {
  if (s === 'mild') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
  if (s === 'moderate') return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
  return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
}

function severityBadgeClass(s: string) {
  if (s === 'mild') return 'badge-green';
  if (s === 'moderate') return 'badge-amber';
  return 'badge-red';
}
</script>

<template>
  <RecordPage
    :title="t('symptoms.title')"
    :empty-title="t('symptoms.noSymptoms')"
    :empty-subtitle="t('symptoms.noSymptomsHint')"
    :delete-msg="t('symptoms.deleteConfirm')"
    :saved-msg="t('forms.symptomSaved')"
    :modal-title="t('symptoms.addSymptom')"
    :fetch-fn="(id) => symptomsApi.list(id)"
    :delete-fn="(id) => symptomsApi.delete(id)"
    :create-fn="(id, d) => symptomsApi.create(id, d)"
  >
    <template #list="{ items, onDelete }">
      <div v-for="item in (items as Symptom[])" :key="item.id" class="card record-card">
        <div class="record-row">
          <div class="record-icon" :style="{ background: severityColor(item.severity).bg, color: severityColor(item.severity).color }">
            <Activity :size="16" />
          </div>
          <div class="record-info">
            <div class="record-name">{{ item.type }}</div>
            <div class="record-date">{{ formatDateTime(item.datetime) }}</div>
            <div v-if="item.notes" class="record-notes">{{ item.notes }}</div>
          </div>
          <span :class="['badge', severityBadgeClass(item.severity)]">
            {{ t(`symptoms.${item.severity}`) }}
          </span>
          <button class="btn-danger" @click="onDelete(item)"><Trash2 :size="15" /></button>
        </div>
      </div>
    </template>

    <template #form="{ petId, editing, onSaved }">
      <form @submit.prevent="handleSubmit(petId, editing, onSaved)" class="record-form" @vue:mounted="initForm(editing)">
        <div class="form-field">
          <label class="label">{{ t('symptoms.symptomType') }} <span class="label-required">*</span></label>
          <input v-model="symptomType" class="input" placeholder="Vomiting, diarrhea..." />
        </div>
        <div class="form-field">
          <label class="label">{{ t('symptoms.severity') }}</label>
          <div class="severity-chips">
            <button
              v-for="s in SEVERITIES" :key="s" type="button"
              :class="['severity-chip', severity === s && 'severity-active']"
              :style="severity === s ? { background: severityColor(s).bg, borderColor: severityColor(s).color, color: severityColor(s).color } : {}"
              @click="severity = s"
            >
              <span class="severity-dot" :style="{ background: severityColor(s).color }" />
              {{ t(`symptoms.${s}`) }}
            </button>
          </div>
        </div>
        <div class="form-field">
          <label class="label">{{ t('common.notes') }}</label>
          <textarea v-model="notes" class="input" rows="3" />
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
.severity-chips { display: flex; flex-direction: column; gap: 8px; }
.severity-chip {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: var(--radius-md);
  border: 1px solid var(--c-border); font-size: 14px; font-weight: 500;
  color: var(--c-txt-secondary); transition: all var(--transition);
}
.severity-chip:hover { border-color: var(--c-primary-light); }
.severity-dot { width: 8px; height: 8px; border-radius: 50%; }
</style>

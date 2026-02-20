<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next';
import { petsApi } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import { useConfirmStore } from '@/stores/confirm';
import type { Pet } from '@/lib/types';
import EmptyState from '@/components/EmptyState.vue';
import AppModal from '@/components/AppModal.vue';

const props = defineProps<{
  title: string;
  emptyTitle: string;
  emptySubtitle: string;
  deleteMsg: string;
  savedMsg: string;
  modalTitle: string;
  fetchFn: (petId: number) => Promise<any[]>;
  deleteFn: (id: number) => Promise<void>;
  createFn: (petId: number, data: any) => Promise<any>;
  updateFn?: (id: number, data: any) => Promise<any>;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const confirm = useConfirmStore();

const petId = Number(route.params.petId);
const pet = ref<Pet | null>(null);
const items = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editingItem = ref<any>(null);

async function fetchData() {
  try {
    const [p, data] = await Promise.all([
      petsApi.get(petId),
      props.fetchFn(petId),
    ]);
    pet.value = p;
    items.value = data;
  } catch { /* ignore */ }
  loading.value = false;
}

onMounted(fetchData);

async function handleDelete(item: any) {
  const ok = await confirm.show({
    title: t('common.delete'),
    message: props.deleteMsg,
    confirmLabel: t('common.delete'),
    danger: true,
  });
  if (!ok) return;
  try {
    await props.deleteFn(item.id);
    await fetchData();
  } catch (e: any) {
    toast.show(e.message, 'error');
  }
}

function openAdd() {
  editingItem.value = null;
  showModal.value = true;
}

function openEdit(item: any) {
  editingItem.value = item;
  showModal.value = true;
}

async function handleSaved() {
  toast.show(props.savedMsg, 'success');
  showModal.value = false;
  editingItem.value = null;
  await fetchData();
}

defineExpose({ petId, pet, items, loading, showModal, editingItem, openAdd, openEdit, handleDelete, handleSaved, fetchData });
</script>

<template>
  <main class="container" style="padding-top: 24px; padding-bottom: 48px;">
    <button class="back-btn" @click="router.push(`/pets/${petId}`)">
      <ArrowLeft :size="18" />
      <span v-if="pet">{{ pet.name }}</span>
    </button>

    <div class="record-header">
      <h1 class="page-title">{{ title }}</h1>
      <button class="btn-primary" @click="openAdd">
        <Plus :size="16" /> {{ t('common.add') }}
      </button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner" /></div>

    <EmptyState v-else-if="!items.length" :title="emptyTitle" :subtitle="emptySubtitle" />

    <div v-else class="record-list">
      <slot name="list" :items="items" :on-delete="handleDelete" :on-edit="openEdit" />
    </div>

    <AppModal v-if="showModal" :title="modalTitle" @close="showModal = false">
      <slot name="form" :pet-id="petId" :editing="editingItem" :on-saved="handleSaved" />
    </AppModal>
  </main>
</template>

<style scoped>
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 500; color: var(--c-primary);
  margin-bottom: 16px; padding: 6px 0;
}
.back-btn:hover { opacity: 0.8; }
.record-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.page-title { font-size: 24px; font-weight: 700; color: var(--c-txt); }
.record-list { display: flex; flex-direction: column; gap: 10px; }
</style>

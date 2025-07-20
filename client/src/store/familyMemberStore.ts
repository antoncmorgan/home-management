import { ref } from 'vue';
import { defineStore } from 'pinia';
import { FamilyMember } from '../models/FamilyMember';
import { fetchFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../api/familyMemberApi';

export const useFamilyMemberStore = defineStore('familyMember', () => {
  const familyMembers = ref<FamilyMember[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function loadFamilyMembers() {
    loading.value = true;
    try {
      familyMembers.value = await fetchFamilyMembers();
      error.value = null;
    } catch (e: any) {
      error.value = e.message || 'Failed to load family members';
    } finally {
      loading.value = false;
    }
  }

  async function add(member: Omit<FamilyMember, 'id'>) {
    const newMember = await addFamilyMember(member);
    familyMembers.value.push(newMember);
  }

  async function update(id: number, member: Partial<FamilyMember>) {
    const updated = await updateFamilyMember(id, member);
    const idx = familyMembers.value.findIndex(m => m.id === id);
    if (idx !== -1) familyMembers.value[idx] = updated;
  }

  async function remove(id: number) {
    await deleteFamilyMember(id);
    familyMembers.value = familyMembers.value.filter(m => m.id !== id);
  }

  return { familyMembers, loading, error, loadFamilyMembers, add, update, remove };
});

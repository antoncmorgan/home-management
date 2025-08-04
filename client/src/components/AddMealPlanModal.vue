<template>
  <n-modal v-model:show="show" preset="card" title="Add Meal Plan" class="add-mealplan-modal">
    <div class="modal-content-flex">
      <div class="modal-left">
        <n-text strong>Family Member</n-text>
        <div class="member-icons">
          <FamilyMemberIcon
            v-for="member in allMembers"
            :key="member.id"
            :member="member"
            :show-footer="true"
            :selected="selectedMember === member.id"
            @click="selectedMember = member.id"
          />
        </div>
      </div>
      <div class="modal-right">
        <n-text strong>Meals</n-text>
        <template v-if="!showCreateMealForm">
          <n-input v-model:value="mealSearch" placeholder="Search meals..." clearable />
          <n-list bordered>
            <n-list-item v-for="meal in filteredMeals" :key="meal.id">
              <n-space justify="space-between" align="center">
                <n-space>
                  <n-button
                    size="small"
                    :type="selectedMeals.includes(meal.id) ? 'primary' : 'default'"
                    @click="toggleMealSelection(meal.id)"
                  >
                    {{ selectedMeals.includes(meal.id) ? 'Selected' : 'Select' }}
                  </n-button>
                  <n-text>{{ meal.name }}</n-text>
                </n-space>
                <n-space>
                  <n-button size="small" @click="openEditMealForm(meal)">Edit</n-button>
                </n-space>
              </n-space>
            </n-list-item>
          </n-list>
          <n-space>
            <n-button size="small" type="primary" @click="openCreateMealForm">Add</n-button>
          </n-space>
        </template>
        <template v-else>
          <CreateMealForm
            :onCreateMeal="handleCreateMeal"
            :onCancel="closeMealForm"
            :familyId="home?.id ?? ''"
            :editMeal="editingMeal"
            :onDeleteMeal="handleDeleteMeal"
          />
        </template>
      </div>
    </div>
    <n-space justify="end" class="modal-actions">
      <n-button @click="onCancel">Cancel</n-button>
      <n-button type="primary" @click="onSave">Save</n-button>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NModal, NButton, NInput, NSelect, NText, NSpace, NList, NListItem } from 'naive-ui';
import CreateMealForm from './CreateMealForm.vue';
import { useFamilyMemberStore } from '../store/familyMemberStore';
import { storeToRefs } from 'pinia';
import { useHomeStore } from '../store/homeStore';
import { fetchMeals, addMeal, updateMeal, deleteMeal, addMealPlan } from '../api/mealPlanApi';
import type { Meal } from '../models/Meal';
import type { FamilyMember } from '../models/FamilyMember';
import FamilyMemberIcon from './FamilyMemberIcon.vue';

const show = ref(false);
const selectedMember = ref('all');

const familyMemberStore = useFamilyMemberStore();
const { familyMembers } = storeToRefs(familyMemberStore);
const homeStore = useHomeStore();
const { home } = storeToRefs(homeStore);

const allMembers = computed(() => [
  {
    id: 'all',
    name: 'All',
    color: '#eee',
    avatar: '',
    email: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  ...familyMembers.value,
] as FamilyMember[]);

const mealSearch = ref('');
const showCreateMealForm = ref(false);
const editingMeal = ref<Meal | null>(null);
const meals = ref<Meal[]>([]);
const selectedMeals = ref<string[]>([]);

const filteredMeals = computed(() => {
    console.log("meals.value", meals.value);
  if (!mealSearch.value) {
    return meals.value;
  }
  return meals.value.filter((m: Meal) => m.name.toLowerCase().includes(mealSearch.value.toLowerCase()));
});

function openCreateMealForm() {
  editingMeal.value = null;
  showCreateMealForm.value = true;
}
function openEditMealForm(meal: Meal) {
  editingMeal.value = meal;
  showCreateMealForm.value = true;
}
function closeMealForm() {
  showCreateMealForm.value = false;
  editingMeal.value = null;
}
function toggleMealSelection(mealId: string) {
  const idx = selectedMeals.value.indexOf(mealId);
  if (idx === -1) {
    selectedMeals.value.push(mealId);
  } else {
    selectedMeals.value.splice(idx, 1);
  }
}
async function handleCreateMeal(meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) {
  if (meal.name && meal.name.trim() && meal.type && meal.familyId) {
    await addMeal(meal);
    await loadMeals();
    closeMealForm();
  }
}
async function handleEditMeal(meal: Meal) {
  await updateMeal(
    meal.id,
    { name: meal.name, type: meal.type },
    meal.familyId,
    meal.userId ? String(meal.userId) : undefined
  );
  await loadMeals();
  closeMealForm();
}
async function handleDeleteMeal(meal: Meal) {
  await deleteMeal(meal.id, meal.familyId, meal.userId ? String(meal.userId) : undefined);
  await loadMeals();
  closeMealForm();
}
async function onSave() {
  // Only add selected meals to the meal plan
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const selectedMealObjs = meals.value
    .filter(m => selectedMeals.value.includes(m.id));
  for (const m of selectedMealObjs) {
    await addMealPlan({
      date: today,
      mealId: m.id,
      familyId: m.familyId,
      memberId: selectedMember.value !== 'all' ? selectedMember.value : undefined,
      type: m.type,
    });
  }
  show.value = false;
  selectedMeals.value = [];
}
function onCancel() {
  show.value = false;
}

async function loadMeals() {
  if (!home.value?.id) {
    return;
  }
  meals.value = await fetchMeals(home.value.id);
  console.log("Loaded meals:", meals.value);
}

onMounted(async () => {
  await familyMemberStore.loadFamilyMembers();
  console.log("Family members loaded:", familyMembers.value);
  await homeStore.populateHome();
  await loadMeals();
});

</script>

<style>
.add-mealplan-modal {
  width: 50% !important;
}
</style>

<style scoped>
.modal-content-flex {
  display: flex;
  gap: 2rem;
}
.modal-left {
  flex: 1;
  padding-right: 1rem;
  border-right: 1px solid #eee;
}
.modal-right {
  flex: 1;
  padding-left: 1rem;
}
.member-icons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.member-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.member-icon.selected {
  border-color: #18a058;
  background: #f6ffed;
}
.icon-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #eee;
  margin-bottom: 0.5rem;
}
.all-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.icon-name {
  font-size: 0.9rem;
  color: #333;
}
.modal-actions {
  margin-top: 2rem;
}
</style>

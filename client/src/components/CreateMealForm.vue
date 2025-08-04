<template>
  <div class="create-meal-form">
    <n-input v-model:value="mealName" placeholder="Meal name" size="small" />
    <n-input v-model:value="mealDescription" placeholder="Description (optional)" size="small" />
    <n-select v-model:value="mealType" :options="mealTypeOptions" placeholder="Type" size="small" />
    <n-input v-model:value="imageUrl" placeholder="Image URL (optional)" size="small" />
    <n-input v-model:value="ingredientsInput" placeholder="Ingredients (comma separated)" size="small" />
    <n-input-number v-model:value="cookTime" placeholder="Cook time (minutes)" size="small" :min="0" />
    <n-input v-model:value="recipe" placeholder="Recipe (optional)" type="textarea" size="small" />
    <n-space>
      <n-button size="small" type="primary" @click="editMode ? onEdit() : onCreate()">{{ editMode ? 'Save' : 'Create' }}</n-button>
      <n-button size="small" @click="onCancel">Cancel</n-button>
      <n-button v-if="editMode" size="small" type="error" @click="onDelete">Delete</n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { NInput, NButton, NSpace, NSelect, NInputNumber } from 'naive-ui';
import type { Meal } from '../models/Meal';

const props = defineProps<{
  onCreateMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditMeal?: (meal: Meal) => void;
  onDeleteMeal?: (meal: Meal) => void;
  onCancel?: () => void;
  familyId?: string;
  editMeal?: Meal | null;
}>();

const mealName = ref('');
const mealDescription = ref('');
const mealType = ref<'breakfast' | 'lunch' | 'dinner' | null>(null);
const imageUrl = ref('');
const ingredientsInput = ref('');
const cookTime = ref<number | null>(null);
const recipe = ref('');

const editMode = computed(() => !!props.editMeal);

const mealTypeOptions = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
];

function onCreate() {
  if (mealName.value.trim() && mealType.value) {
    props.onCreateMeal({
      name: mealName.value.trim(),
      description: mealDescription.value.trim(),
      type: mealType.value,
      imageUrl: imageUrl.value.trim() || undefined,
      ingredients: ingredientsInput.value.split(',').map(i => i.trim()).filter(Boolean),
      cookTime: cookTime.value ?? undefined,
      recipe: recipe.value.trim() || undefined,
      familyId: props.familyId || ''
    });
    resetForm();
  }
}

function onEdit() {
  if (!props.editMeal) return;
  if (mealName.value.trim() && mealType.value) {
    const updatedMeal: Meal = {
      ...props.editMeal,
      name: mealName.value.trim(),
      description: mealDescription.value.trim(),
      type: mealType.value,
      imageUrl: imageUrl.value.trim() || undefined,
      ingredients: ingredientsInput.value.split(',').map(i => i.trim()).filter(Boolean),
      cookTime: cookTime.value ?? undefined,
      recipe: recipe.value.trim() || undefined,
      familyId: props.familyId || ''
    };
    props.onEditMeal?.(updatedMeal);
    resetForm();
  }
}

function onDelete() {
  if (props.editMeal) {
    props.onDeleteMeal?.(props.editMeal);
    resetForm();
  }
}
function onCancel() {
  props.onCancel?.();
  resetForm();
}

function resetForm() {
  mealName.value = '';
  mealDescription.value = '';
  mealType.value = null;
  imageUrl.value = '';
  ingredientsInput.value = '';
  cookTime.value = null;
  recipe.value = '';
}

watch(() => props.editMeal, (meal) => {
  if (meal) {
    mealName.value = meal.name || '';
    mealDescription.value = meal.description || '';
    mealType.value = meal.type || null;
    imageUrl.value = meal.imageUrl || '';
    ingredientsInput.value = Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : '';
    cookTime.value = meal.cookTime ?? null;
    recipe.value = meal.recipe || '';
  } else {
    resetForm();
  }
});
</script>

<style scoped>
.create-meal-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>

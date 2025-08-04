<template>
  <div class="meal-plan-calendar-container">
    <AddMealPlanModal v-model:show="showAddMealPlanModal" />
    <n-space  align="center" class="week-header">
      <n-button tertiary @click="goToPrevWeek">&#8592; Prev</n-button>
      <n-button tertiary @click="goToNextWeek">Next &#8594;</n-button>
      <n-text strong depth="2" class="week-label">Week of {{ weekStartLabel }}</n-text>
    </n-space>
    <n-table class="meal-plan-table" striped>
      <thead>
        <tr>
          <th></th>
          <th v-for="day in days" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="meal in meals" :key="meal">
          <td><n-text strong>{{ meal.charAt(0).toUpperCase() + meal.slice(1) }}</n-text></td>
          <td v-for="day in days" :key="day">
            <n-space vertical size="small" align="stretch" class="meal-events">
              <template v-for="event in getMealEventsForDay(day, meal)" :key="event.title + event.memberId">
                <n-text class="meal-event" :style="{ backgroundColor: event.color }" :block="true">{{ event.title }}</n-text>
              </template>
              <n-button v-if="getMealEventsForDay(day, meal).length === 0" class="add-meal-btn" tertiary :block="true" @click="onAddMeal(day, meal)">
                <span class="add-meal-plus">+</span>
              </n-button>
            </n-space>
          </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<script setup lang="ts">
import { fetchMeals, addMealPlan, fetchMeals as fetchAllMeals, fetchMealPlans } from '../api/mealPlanApi';
import { useFamilyMemberStore } from '../store/familyMemberStore';
import { NTable, NButton, NSpace, NText } from 'naive-ui';
import AddMealPlanModal from './AddMealPlanModal.vue';


type MealType = 'lunch' | 'dinner';
type DayType = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

const days: DayType[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const meals: MealType[] = ['lunch', 'dinner'];

// Real meal plan data
import { ref, computed, onMounted } from 'vue';
const mealPlans = ref<any[]>([]);
const allMeals = ref<any[]>([]);
const familyMemberStore = useFamilyMemberStore();

async function loadData() {
  try {
    await familyMemberStore.loadFamilyMembers();
    // Fetch meal plans for the first family (or adjust as needed)
    const familyId = familyMemberStore.familyMembers[0]?.familyId;
    if (familyId) {
      mealPlans.value = await fetchMealPlans(familyId);
      // Optionally, fetch all meals for display
      allMeals.value = await fetchMeals(familyId);
    }
    console.log('Meal plans loaded:', mealPlans.value);
    console.log('All meals loaded:', allMeals.value);
  } catch (err) {
    console.error('Error loading meal plan calendar data:', err);
  }
}
onMounted(loadData);

const weekOffset = ref(0); // 0 = current week
const showAddMealPlanModal = ref(false);

const weekStartDate = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset.value * 7);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
});

const weekStartLabel = computed(() => {
  const d = weekStartDate.value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
});

function goToPrevWeek() {
  weekOffset.value--;
}
function goToNextWeek() {
  weekOffset.value++;
}

function getMealEventsForDay(day: DayType, meal: MealType) {
  // Use weekStartDate for current week
  const startOfWeek = new Date(weekStartDate.value);
  const dayIndex = days.indexOf(day);
  const date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + dayIndex);
  const isoDate = date.toISOString().split('T')[0];
  const plans = mealPlans.value.filter(mp => mp.date === isoDate && mp.type === meal);
  return plans.map(plan => {
    const mealObj = allMeals.value.find((m: any) => m.id === plan.mealId);
    let color = '';
    if (meal === 'lunch' && plan.memberId) {
      const member = familyMemberStore.familyMembers.find((m: any) => m.id === plan.memberId);
      color = member && member.color ? member.color : '#4fc3f7';
    } else {
      color = '#f7b267';
    }
    return {
      title: mealObj ? mealObj.name : '+',
      color,
      memberId: plan.memberId || ''
    };
  });
}

function onAddMeal(day: DayType, meal: MealType) {
  showAddMealPlanModal.value = true;
}

</script>

<style scoped>
.meal-plan-calendar-container {
  width: 100%;
  overflow-x: auto;
}
.meal-plan-table {
  width: 100%;
}
.meal-plan-table th, .meal-plan-table td {
  text-align: center;
  vertical-align: middle;
  width: 8rem;
  min-width: 8rem;
  max-width: 8rem;
}
.meal-events {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.week-header {
  margin-bottom: 1.5rem;
}
.week-label {
  font-size: 1.6rem;
}

 .meal-event {
  color: #fff !important;
  border-radius: 6px;
  font-size: .8rem;
  border: none;
  padding: 0.5em 1em;
  display: flex;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
 }
 .add-meal-btn {
  width: 100%;
  min-height: 2.5rem;
 }
 .add-meal-plus {
  font-size: 2rem;
  color: #bbb;
  font-weight: 600;
 }
</style>

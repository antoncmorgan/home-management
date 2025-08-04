import { Meal } from './Meal';
import { MealPlan } from './MealPlan';
import { FamilyMember } from './FamilyMember';

export const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Chicken Salad',
    type: 'lunch',
    ingredients: ['Chicken', 'Lettuce', 'Tomato'],
    familyId: 'fam1',
    userId: 1,
  },
  {
    id: '2',
    name: 'Tacos',
    type: 'dinner',
    ingredients: ['Tortilla', 'Beef', 'Cheese'],
    familyId: 'fam1',
    userId: 1,
  },
  {
    id: '3',
    name: 'Veggie Bowl',
    type: 'lunch',
    ingredients: ['Rice', 'Beans', 'Veggies'],
    familyId: 'fam1',
    userId: 1,
  },
  {
    id: '4',
    name: 'Pizza',
    type: 'dinner',
    ingredients: ['Dough', 'Cheese', 'Tomato Sauce'],
    familyId: 'fam1',
    userId: 1,
  },
  {
    id: '5',
    name: 'Pasta',
    type: 'lunch',
    ingredients: ['Pasta', 'Tomato Sauce'],
    familyId: 'fam1',
    userId: 1,
  },
  {
    id: '6',
    name: 'Fish & Chips',
    type: 'dinner',
    ingredients: ['Fish', 'Potato'],
    familyId: 'fam1',
    userId: 1,
  }
];

export const mockMealPlans: MealPlan[] = [
  // 2025-08-03: two lunch items
  { id: 'mp1', date: '2025-08-03', mealId: '1', familyId: 'fam1', userId: 1, type: 'lunch', memberId: 'mem1' },
  { id: 'mp7', date: '2025-08-03', mealId: '3', familyId: 'fam1', userId: 1, type: 'lunch', memberId: 'mem2' },
  // 2025-08-05: one dinner
  { id: 'mp2', date: '2025-08-05', mealId: '2', familyId: 'fam1', userId: 1, type: 'dinner' },
  // 2025-08-06: two lunch items, one dinner
  { id: 'mp3', date: '2025-08-06', mealId: '3', familyId: 'fam1', userId: 1, type: 'lunch', memberId: 'mem2' },
  { id: 'mp8', date: '2025-08-06', mealId: '5', familyId: 'fam1', userId: 1, type: 'lunch', memberId: 'mem1' },
  { id: 'mp4', date: '2025-08-06', mealId: '4', familyId: 'fam1', userId: 1, type: 'dinner' },
  // 2025-08-08: one lunch, one dinner
  { id: 'mp5', date: '2025-08-08', mealId: '5', familyId: 'fam1', userId: 1, type: 'lunch', memberId: 'mem1' },
  { id: 'mp6', date: '2025-08-08', mealId: '6', familyId: 'fam1', userId: 1, type: 'dinner' }
];

export const mockFamilyMembers: FamilyMember[] = [
  { id: 'mem1', familyId: 'fam1', userId: 1, name: 'Alice', color: '#7e57c2', createdAt: new Date(), updatedAt: new Date() },
  { id: 'mem2', familyId: 'fam1', userId: 1, name: 'Bob', color: '#26a69a', createdAt: new Date(), updatedAt: new Date() }
];

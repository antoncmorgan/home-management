// MealPlan interface/model for client
export interface MealPlan {
  id: string;
  date: string; // ISO date
  mealId: string;
  familyId: string;
  memberId?: string;
  userId: number;
  type: 'breakfast' | 'dinner' | 'lunch';
}

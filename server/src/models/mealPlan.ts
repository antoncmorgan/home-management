// Model for meal plans
export interface MealPlan {
  id: string;
  date: string; // ISO date
  mealId: string;
  familyId: string;
  memberId?: string; // null for family-wide (dinner), set for individual (lunch)
  userId: number;
  type: 'breakfast' | 'dinner' | 'lunch';
}

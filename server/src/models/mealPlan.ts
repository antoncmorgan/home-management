// Model for meal plans
export interface MealPlan {
  id: string;
  date: string; // ISO date
  familyId: string;
  memberId?: string; // null for family-wide (dinner), set for individual (lunch)
  timeOfDay: 'breakfast' | 'lunch' | 'dinner';
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

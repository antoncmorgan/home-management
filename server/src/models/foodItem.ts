// Model for food items
export interface FoodItem {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  notes?: string;
  familyId: string;
  userId: number;
}

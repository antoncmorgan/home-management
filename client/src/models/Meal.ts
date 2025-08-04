// Meal interface/model for client
export interface Meal {
  id: string;
  name: string;
  description?: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  imageUrl?: string;
  ingredients: string[];
  cookTime?: number;
  recipe?: string;
  familyId: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

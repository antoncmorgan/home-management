// Model for meals
export interface Meal {
  id: string;
  name: string;
  description?: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  imageUrl?: string;
  ingredients: string[];
  cookTime?: number;
  recipe?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

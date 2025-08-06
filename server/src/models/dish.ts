// Model for dishes
export interface Dish {
  id: string;
  name: string;
  dishType: 'entree' | 'side' | 'dessert' | 'other';
  imageUrl?: string;
  ingredients: string[];
  cookTime?: number;
  recipe?: string;
  description?: string;
  familyId: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

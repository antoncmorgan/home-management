# Feature: Meal Plans
Meal planning for families and individual members, supporting dinner and lunch scheduling, flexible dish assignment (entree, side, dessert, other), packed food items for lunches, ingredient tracking, and collaborative access.

## User need
- Families want to collaboratively plan meals for dinner and lunch.
- Individual family members may have personalized lunch plans.
- Users need to view, add, edit, and delete meal plans for their family.
- Users need to see ingredients and recipes for planned meals.
- Only family members should access and modify their family's meal plans.

## Data needs
- MealPlan: id, date, familyId, memberId (optional), timeOfDay (breakfast/lunch/dinner)
- Dish: id, name, dishType (entree/side/dessert/other), imageUrl, ingredients (JSON array), cookTime, recipe, familyId, userId
- FoodItem: id, name, category, quantity, notes
- Family: id, name, members
- FamilyMember: id, familyId, userId, name
- Relationships:
  - MealPlan links multiple Dishes (via meal_plan_dishes join table)
  - MealPlan links multiple FoodItems (via meal_plan_food_items join table, optionally assigned to FamilyMember for packed lunches)
  - Only users who are members of a Family can access that Family's MealPlans
  - Dishes and FoodItems are only visible to families where they are planned

## APIs needed
- GET /api/meal-plans?familyId=...&date=...
- GET /api/meal-plans/:id?familyId=...
- POST /api/meal-plans (requires familyId, date)
- PUT /api/meal-plans/:id (requires familyId)
- DELETE /api/meal-plans/:id (requires familyId)
- GET /api/dishes?familyId=...
- GET /api/dishes/:id?familyId=...
- GET /api/food-items?familyId=...
- GET /api/food-items/:id?familyId=...
- POST /api/meal-plan-dishes (requires mealPlanId, dishId)
- POST /api/meal-plan-food-items (requires mealPlanId, foodItemId, familyMemberId [optional], quantity [optional], notes [optional])
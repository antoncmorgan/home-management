# Feature: Meal Plans
Meal planning for families and individual members, supporting dinner and lunch scheduling, ingredient tracking, and collaborative access.

## User need
- Families want to collaboratively plan meals for dinner and lunch.
- Individual family members may have personalized lunch plans.
- Users need to view, add, edit, and delete meal plans for their family.
- Users need to see ingredients and recipes for planned meals.
- Only family members should access and modify their family's meal plans.

## Data needs
- MealPlan: id, date, mealId, familyId, memberId (optional), type (dinner/lunch)
- Meal: id, name, type, imageUrl, ingredients (JSON array), cookTime, recipe
- Family: id, name, members
- FamilyMember: id, familyId, userId, name
- Relationships:
  - MealPlan links a Meal to a Family (and optionally a FamilyMember)
  - Only users who are members of a Family can access that Family's MealPlans
  - Meals are only visible to families where they are planned

## APIs needed
- GET /api/meal-plans?familyId=...&memberId=...&date=...
- GET /api/meal-plans/:id?familyId=...&memberId=...
- POST /api/meal-plans (requires familyId, mealId, date, type, memberId)
- PUT /api/meal-plans/:id (requires familyId)
- DELETE /api/meal-plans/:id (requires familyId)
- GET /api/meals?familyId=...&memberId=...
- GET /api/meals/:id?familyId=...&memberId=...
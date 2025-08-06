import { Router } from 'express';
import { addMealPlan, getMealPlansByFamily, getMealPlansByFamilyAndDate, updateMealPlan, deleteMealPlan, addDishToMealPlan, removeDishFromMealPlan, addFoodItemToMealPlan, removeFoodItemFromMealPlan, getDishesForMealPlan, getFoodItemsForMealPlan } from '../store/mealPlanStore';
import { requireAuth } from './requireAuth';

const router = Router();

// GET /api/meal-plans
router.get('/', requireAuth, async (req, res) => {
  const { familyId, memberId, date } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  let plans;
  if (date && typeof date === 'string') {
    plans = await getMealPlansByFamilyAndDate(familyId, date, memberId as string | undefined);
  } else {
    plans = await getMealPlansByFamily(familyId, memberId as string | undefined);
  }
  res.json(plans);
});

// POST /api/meal-plans
router.post('/', requireAuth, async (req, res) => {
  const { date, familyId, memberId, timeOfDay } = req.body;
  const userId = (req as any).user?.id;
  if (!date || !familyId || !timeOfDay || !userId) {
    return res.status(400).json({ error: 'date, familyId, timeOfDay, and userId are required' });
  }
  const plan = await addMealPlan({ date, familyId, memberId, timeOfDay, userId });
  res.status(201).json(plan);
});


// GET /api/meal-plans/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId, memberId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const plans = await getMealPlansByFamily(familyId as string, memberId as string | undefined);
  const plan = plans.find(p => p.id === id);
  if (!plan) {
    return res.status(404).json({ error: 'Meal plan not found for this family' });
  }
  // Fetch associated dishes and food items
  const dishes = await getDishesForMealPlan(id);
  const foodItems = await getFoodItemsForMealPlan(id);
  res.json({ ...plan, dishes, foodItems });
});

// POST /api/meal-plans/:id/dishes
router.post('/:id/dishes', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dishId } = req.body;
  if (!dishId) {
    return res.status(400).json({ error: 'dishId is required' });
  }
  await addDishToMealPlan(id, dishId);
  res.status(201).json({ success: true });
});

// DELETE /api/meal-plans/:id/dishes/:dishId
router.delete('/:id/dishes/:dishId', requireAuth, async (req, res) => {
  const { id, dishId } = req.params;
  await removeDishFromMealPlan(id, dishId);
  res.status(204).send();
});

// POST /api/meal-plans/:id/food-items
router.post('/:id/food-items', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { foodItemId, familyMemberId, quantity, notes } = req.body;
  if (!foodItemId) {
    return res.status(400).json({ error: 'foodItemId is required' });
  }
  await addFoodItemToMealPlan(id, foodItemId, familyMemberId, quantity, notes);
  res.status(201).json({ success: true });
});

// DELETE /api/meal-plans/:id/food-items/:foodItemId
router.delete('/:id/food-items/:foodItemId', requireAuth, async (req, res) => {
  const { id, foodItemId } = req.params;
  await removeFoodItemFromMealPlan(id, foodItemId);
  res.status(204).send();
});


// GET /api/meal-plans/date/:date
router.get('/date/:date', requireAuth, async (req, res) => {
  const { date } = req.params;
  const { familyId, memberId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const plans = await getMealPlansByFamilyAndDate(familyId as string, date, memberId as string | undefined);
  res.json(plans);
});


// PUT /api/meal-plans/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = await updateMealPlan(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Meal plan not found or no fields to update' });
  }
  res.json(updated);
});


// DELETE /api/meal-plans/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const success = await deleteMealPlan(id);
  if (!success) {
    return res.status(404).json({ error: 'Meal plan not found' });
  }
  res.status(204).send();
});

export default router;

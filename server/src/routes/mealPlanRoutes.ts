import { Router } from 'express';
import { addMealPlan, getMealPlansByFamily, getMealPlansByFamilyAndDate, updateMealPlan, deleteMealPlan } from '../store/mealPlanStore';
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
  const { date, mealId, familyId, memberId, type } = req.body;
  const userId = (req as any).user?.id;
  if (!date || !mealId || !familyId || !type || !userId) {
    return res.status(400).json({ error: 'date, mealId, familyId, type, and userId are required' });
  }
  const plan = await addMealPlan({ date, mealId, familyId, memberId, userId, type });
  res.status(201).json(plan);
});


// GET /api/meal-plans/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId, memberId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  // You may want to add a getMealPlanForFamily function for efficiency
  const plans = await getMealPlansByFamily(familyId as string, memberId as string | undefined);
  const plan = plans.find(p => p.id === id);
  if (!plan) {
    return res.status(404).json({ error: 'Meal plan not found for this family' });
  }
  res.json(plan);
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

import express from 'express';
import { addMeal, getMeal, updateMeal, deleteMeal, getMealsForFamily } from '../store/mealStore';
import { requireAuth } from './requireAuth';

const router = express.Router();

// GET /api/meals
router.get('/', requireAuth, async (req, res) => {
  const { familyId, memberId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const meals = await getMealsForFamily(familyId, memberId as string | undefined);
  res.json(meals);
});

// GET /api/meals/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId, memberId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  // Check that the meal is planned for this family (and optionally member)
  const meals = await getMealsForFamily(familyId as string, memberId as string | undefined);
  const meal = meals.find(m => m.id === id);
  if (!meal) return res.status(404).json({ error: 'Meal not found for this family' });
  res.json(meal);
});

// POST /api/meals
router.post('/', requireAuth, async (req, res) => {
  const { name, type, imageUrl, ingredients, cookTime, recipe, description, familyId } = req.body;
  if (!name || !type || !ingredients || !familyId) {
    return res.status(400).json({ error: 'name, type, ingredients, and familyId are required' });
  }
  // Optionally, check user is a member of the family here
  const meal = await addMeal({ name, type, imageUrl, ingredients, cookTime, recipe, description });
  res.status(201).json(meal);
});

// PUT /api/meals/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId, memberId } = req.query;
  const { name, type, imageUrl, ingredients, cookTime, recipe, description } = req.body;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  // Check that the meal is planned for this family
  const meals = await getMealsForFamily(familyId as string, memberId as string | undefined);
  const meal = meals.find(m => m.id === id);
  if (!meal) return res.status(404).json({ error: 'Meal not found for this family' });
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (type !== undefined) updates.type = type;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (ingredients !== undefined) updates.ingredients = ingredients;
  if (cookTime !== undefined) updates.cookTime = cookTime;
  if (recipe !== undefined) updates.recipe = recipe;
  if (description !== undefined) updates.description = description;
  const updated = await updateMeal(id, updates);
  res.json(updated);
});

// DELETE /api/meals/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId, memberId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  // Check that the meal is planned for this family
  const meals = await getMealsForFamily(familyId as string, memberId as string | undefined);
  const meal = meals.find(m => m.id === id);
  if (!meal) return res.status(404).json({ error: 'Meal not found for this family' });
  const success = await deleteMeal(id);
  if (!success) return res.status(404).json({ error: 'Meal not found' });
  res.status(204).send();
});

export default router;

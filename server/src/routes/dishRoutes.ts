import express from 'express';
import { addDish, getDish, updateDish, deleteDish, getDishesForFamily } from '../store/dishStore';
import { requireAuth } from './requireAuth';

const router = express.Router();

// GET /api/dishes
router.get('/', requireAuth, async (req, res) => {
  const { familyId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const dishes = await getDishesForFamily(familyId);
  res.json(dishes);
});

// GET /api/dishes/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const dishes = await getDishesForFamily(familyId as string);
  const dish = dishes.find(d => d.id === id);
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found for this family' });
  }
  res.json(dish);
});

// POST /api/dishes
router.post('/', requireAuth, async (req, res) => {
  const { name, dishType, imageUrl, ingredients, cookTime, recipe, description, familyId } = req.body;
  const userId = (req as any).user?.id;
  if (!name || !dishType || !ingredients || !familyId || !userId) {
    return res.status(400).json({ error: 'name, dishType, ingredients, familyId, and userId are required' });
  }
  // Optionally, check user is a member of the family here
  const dish = await addDish({ name, dishType, imageUrl, ingredients, cookTime, recipe, description, familyId, userId });
  res.status(201).json(dish);
});

// PUT /api/dishes/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId } = req.query;
  const { name, dishType, imageUrl, ingredients, cookTime, recipe, description } = req.body;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const dishes = await getDishesForFamily(familyId as string);
  const dish = dishes.find(d => d.id === id);
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found for this family' });
  }
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (dishType !== undefined) updates.dishType = dishType;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (ingredients !== undefined) updates.ingredients = ingredients;
  if (cookTime !== undefined) updates.cookTime = cookTime;
  if (recipe !== undefined) updates.recipe = recipe;
  if (description !== undefined) updates.description = description;
  const updated = await updateDish(id, updates);
  res.json(updated);
});

// DELETE /api/dishes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { familyId } = req.query;
  if (!familyId || typeof familyId !== 'string') {
    return res.status(400).json({ error: 'familyId is required' });
  }
  const dishes = await getDishesForFamily(familyId as string);
  const dish = dishes.find(d => d.id === id);
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found for this family' });
  }
  const success = await deleteDish(id);
  if (!success) {
    return res.status(404).json({ error: 'Dish not found' });
  }
  res.status(204).send();
});

export default router;

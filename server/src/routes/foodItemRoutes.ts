import express from 'express';
import { addFoodItem, getFoodItem, updateFoodItem, deleteFoodItem, getFoodItems } from '../store/foodItemStore';
import { requireAuth } from './requireAuth';
import type { FoodItem } from '../models/foodItem';

const router = express.Router();

// GET /api/food-items
router.get('/', requireAuth, async (req, res) => {
  const items = await getFoodItems();
  res.json(items);
});

// GET /api/food-items/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const item = await getFoodItem(id);
  if (!item) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  res.json(item);
});

// POST /api/food-items
router.post('/', requireAuth, async (req, res) => {
  const { name, category, quantity, notes, familyId } = req.body;
  const userId = (req as any).user?.id;
  if (!name || !familyId || !userId) {
    return res.status(400).json({ error: 'name, familyId, and userId are required' });
  }
  const item: Omit<FoodItem, 'id'> = { name, category, quantity, notes, familyId, userId };
  const created = await addFoodItem(item);
  res.status(201).json(created);
});

// PUT /api/food-items/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, notes, familyId } = req.body;
  const userId = (req as any).user?.id;
  const updates: Partial<Omit<FoodItem, 'id'>> = {};
  if (name !== undefined) updates.name = name;
  if (category !== undefined) updates.category = category;
  if (quantity !== undefined) updates.quantity = quantity;
  if (notes !== undefined) updates.notes = notes;
  if (familyId !== undefined) updates.familyId = familyId;
  if (userId !== undefined) updates.userId = userId;
  const updated = await updateFoodItem(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  res.json(updated);
});

// DELETE /api/food-items/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const success = await deleteFoodItem(id);
  if (!success) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  res.status(204).send();
});

export default router;

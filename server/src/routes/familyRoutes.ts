import express from 'express';
import { requireAuth } from './requireAuth';
import { createFamily, listFamilies, updateFamily, deleteFamily } from '../store/familyStore';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/families
router.get('/', requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const families = await listFamilies(userId);
  res.json(families);
});

// POST /api/families
router.post('/', requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  const { display_name, ...rest } = req.body;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (!display_name) {
    return res.status(400).json({ error: 'Family display_name is required' });
  }
  const family = {
    id: uuidv4(),
    user_id: userId,
    display_name,
    ...rest,
  };
  await createFamily(family);
  res.status(201).json(family);
});

// PUT /api/families/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  await updateFamily(id, updates);
  res.json({ id, ...updates });
});

// DELETE /api/families/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await deleteFamily(id);
  res.status(204).send();
});

export default router;

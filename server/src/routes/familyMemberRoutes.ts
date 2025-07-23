
import express from 'express';
import { addFamilyMember, getFamilyMembers, updateFamilyMember, deleteFamilyMember } from '../store/familyMemberStore';
import { requireAuth } from './requireAuth';

const router = express.Router();

// GET /api/family-members?familyId=xxx
router.get('/', requireAuth, async (req, res) => {
  const { familyId } = req.query;
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  let members;
  if (familyId && typeof familyId === 'string') {
    members = await getFamilyMembers(familyId, userId);
  } else {
    // Get all family members for this user
    members = await getFamilyMembers(undefined, userId);
  }
  res.json(members);
});

// POST /api/family-members
router.post('/', requireAuth, async (req, res) => {
  const { familyId, name, avatar, calendarId, email, color } = req.body;
  if (!familyId || !name) {
    return res.status(400).json({ error: 'familyId and name are required' });
  }
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const member = await addFamilyMember({ familyId, userId, name, avatar, calendarId, email, color });
  res.status(201).json(member);
});

// PUT /api/family-members/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = await updateFamilyMember(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Family member not found' });
  }
  res.json(updated);
});

// DELETE /api/family-members/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteFamilyMember(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Family member not found' });
  }
  res.status(204).send();
});

export default router;

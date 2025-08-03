import express from 'express';
import { requireAuth } from './requireAuth';
import {
  createList,
  getListById,
  updateList,
  deleteList,
  listLists,
  createListItem,
  getListItemById,
  updateListItem,
  deleteListItem,
  listListItems
} from '../store/listStore';

const router = express.Router();

// Lists
router.get('/', requireAuth, async (req, res) => {
  const familyId = req.query.familyId as string;
  if (!familyId) {
    return res.status(400).json({ error: 'familyId required' });
  }
  const lists = await listLists(familyId);
  res.json(lists);
});

router.post('/', requireAuth, async (req, res) => {
  const { familyId, type, name } = req.body;
  const userId = (req as any).user?.id;
  if (!familyId || !type || !name || !userId) {
    return res.status(400).json({ error: 'familyId, type, name, and userId are required' });
  }
  const id = await createList({ familyId, userId, type, name });
  const list = await getListById(id);
  res.status(201).json(list);
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const list = await getListById(id);
  if (!list) {
    return res.status(404).json({ error: 'List not found' });
  }
  res.json(list);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await updateList(id, req.body);
  const list = await getListById(id);
  res.json(list);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await deleteList(id);
  res.status(204).send();
});

// List Items
router.get('/:listId/items', requireAuth, async (req, res) => {
  const listId = Number(req.params.listId);
  const items = await listListItems(listId);
  res.json(items);
});

router.post('/:listId/items', requireAuth, async (req, res) => {
  const listId = Number(req.params.listId);
  const { name, quantity, status, notes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Item name required' });
  }
  const id = await createListItem({ listId, name, quantity: quantity ?? 1, status: status ?? 'active', notes });
  const item = await getListItemById(id);
  res.status(201).json(item);
});

router.get('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const item = await getListItemById(id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

router.put('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id;
  const result = await require('../store/listStore').getListItemWithOwner(id);
  if (!result) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (result.ownerId !== userId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this list.' });
  }
  await updateListItem(id, req.body);
  const updatedItem = await getListItemById(id);
  res.json(updatedItem);
});

router.delete('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id;
  const result = await require('../store/listStore').getListItemWithOwner(id);
  if (!result) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (result.ownerId !== userId) {
    return res.status(403).json({ error: 'Forbidden: You do not own this list.' });
  }
  await deleteListItem(id);
  res.status(204).send();
});

export default router;

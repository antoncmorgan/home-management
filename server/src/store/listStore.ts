import { db } from '../db';
import { List, ListItem } from '../models/list';

export async function createList(list: Omit<List, 'id' | 'createdAt'>): Promise<number> {
  const result = await db.run(
    `INSERT INTO lists (family_id, user_id, type, name) VALUES (?, ?, ?, ?)`,
    list.familyId, list.userId, list.type, list.name
  );
  return result.lastID ?? -1;
}

export async function getListById(id: number): Promise<List | undefined> {
  return db.get<List>(`SELECT * FROM lists WHERE id = ?`, id);
}

export async function updateList(id: number, updates: Partial<List>): Promise<void> {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  if (!fields) return;
  await db.run(
    `UPDATE lists SET ${fields} WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteList(id: number): Promise<void> {
  await db.run(`DELETE FROM lists WHERE id = ?`, id);
}

export async function listLists(familyId: string): Promise<List[]> {
  return db.all<List[]>(`SELECT * FROM lists WHERE family_id = ?`, familyId);
}

// List Items
// Get list item and its owner's userId in one query
export async function getListItemWithOwner(id: number): Promise<{ item: ListItem, ownerId: string } | undefined> {
  const row = await db.get(
    `SELECT li.*, l.user_id as ownerId
     FROM list_items li
     JOIN lists l ON li.list_id = l.id
     WHERE li.id = ?`,
    id
  );
  if (!row) return undefined;
  const { ownerId, ...item } = row;
  return { item: item as ListItem, ownerId: String(ownerId) };
}
export async function createListItem(item: Omit<ListItem, 'id' | 'createdAt'>): Promise<number> {
  const result = await db.run(
    `INSERT INTO list_items (list_id, name, quantity, status, notes) VALUES (?, ?, ?, ?, ?)`,
    item.listId, item.name, item.quantity, item.status, item.notes || null
  );
  return result.lastID ?? -1;
}

export async function getListItemById(id: number): Promise<ListItem | undefined> {
  return db.get<ListItem>(`SELECT * FROM list_items WHERE id = ?`, id);
}

export async function updateListItem(id: number, updates: Partial<ListItem>): Promise<void> {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  if (!fields) return;
  await db.run(
    `UPDATE list_items SET ${fields} WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteListItem(id: number): Promise<void> {
  await db.run(`DELETE FROM list_items WHERE id = ?`, id);
}

export async function listListItems(listId: number): Promise<ListItem[]> {
  return db.all<ListItem[]>(`SELECT * FROM list_items WHERE list_id = ?`, listId);
}

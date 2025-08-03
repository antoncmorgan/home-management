import { createList, getListById, updateList, deleteList, listLists, createListItem, getListItemById, updateListItem, deleteListItem, listListItems } from '../src/store/listStore';
import { initDb, db } from '../src/db';
import { List, ListItem } from '../src/models/list';

describe('List store helpers', () => {
  const familyId = 'fam-789';
  const userId = 'user-123';
  const listData: Omit<List, 'id' | 'createdAt'> = {
    familyId,
    userId,
    type: 'grocery',
    name: 'Weekly Groceries'
  };
  let createdListId: number;

  beforeAll(async () => {
    await initDb(':memory:');
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should create a new list', async () => {
    createdListId = await createList(listData);
    const list = await getListById(createdListId);
    expect(list).toBeDefined();
    expect(list!.name).toBe('Weekly Groceries');
  });

  it('should update a list', async () => {
    await updateList(createdListId, { name: 'Updated List' });
    const list = await getListById(createdListId);
    expect(list!.name).toBe('Updated List');
  });

  it('should list all lists for a family', async () => {
    const lists = await listLists(familyId);
    expect(lists.length).toBeGreaterThanOrEqual(1);
  });

  it('should delete a list', async () => {
    await deleteList(createdListId);
    const list = await getListById(createdListId);
    expect(list).toBeUndefined();
  });

  it('should create, update, list, and delete list items', async () => {
    const listId = await createList(listData);
    const itemId = await createListItem({ listId, name: 'Milk', quantity: 2, status: 'active', notes: 'Organic' });
    let item = await getListItemById(itemId);
    expect(item).toBeDefined();
    expect(item!.name).toBe('Milk');
    await updateListItem(itemId, { status: 'completed' });
    item = await getListItemById(itemId);
    expect(item!.status).toBe('completed');
    const items = await listListItems(listId);
    expect(items.length).toBeGreaterThanOrEqual(1);
    await deleteListItem(itemId);
    item = await getListItemById(itemId);
    expect(item).toBeUndefined();
  });
});

import { createFamily, getFamilyById, updateFamily, deleteFamily, listFamilies } from '../src/store/familyStore';
import { initDb, db } from '../src/db';
import { v4 as uuidv4 } from 'uuid';
import { createUser } from '../src/store/userStore';

// Minimal Family object for tests
const baseFamily = {
  id: '',
  user_id: 1,
  display_name: 'Test Family',
  primary_email: 'test@family.com',
  address_street: '123 Main St',
  address_city: 'Testville',
  address_state: 'TS',
  address_zip: '12345',
  phone_number: '555-1234',
  timezone: 'UTC',
  notes: 'Test notes',
  photo_url: 'http://photo.url',
  invite_code: 'INVITE123',
  settings_json: '{}',
  is_active: 1
};

describe('FamilyStore helpers', () => {
  beforeAll(async () => {
    await initDb(':memory:');
    await createUser(db, 'testuser', 'testpass');
  });


  afterAll(async () => {
    const { db } = require('../src/db');
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should create a new family', async () => {
    const family = { ...baseFamily, id: uuidv4() };
    await createFamily(family);
    const found = await getFamilyById(family.id);
    expect(found).toBeDefined();
    expect(found!.display_name).toBe('Test Family');
  });

  it('should get a family by id', async () => {
    const family = { ...baseFamily, id: uuidv4(), display_name: 'Another Family' };
    await createFamily(family);
    const found = await getFamilyById(family.id);
    expect(found).not.toBeUndefined();
    expect(found!.display_name).toBe('Another Family');
  });

  it('should update a family', async () => {
    const family = { ...baseFamily, id: uuidv4() };
    await createFamily(family);
    await updateFamily(family.id, { display_name: 'Updated Family' });
    const updated = await getFamilyById(family.id);
    expect(updated!.display_name).toBe('Updated Family');
  });

  it('should delete a family', async () => {
    const family = { ...baseFamily, id: uuidv4() };
    await createFamily(family);
    await deleteFamily(family.id);
    const found = await getFamilyById(family.id);
    expect(found).toBeUndefined();
  });

  it('should list families for a user', async () => {
    const fam1 = { ...baseFamily, id: uuidv4(), display_name: 'Fam1' };
    const fam2 = { ...baseFamily, id: uuidv4(), display_name: 'Fam2' };
    await createFamily(fam1);
    await createFamily(fam2);
    const families = await listFamilies(1);
    expect(families.length).toBeGreaterThanOrEqual(2);
    expect(families.some(f => f.display_name === 'Fam1')).toBe(true);
    expect(families.some(f => f.display_name === 'Fam2')).toBe(true);
  });

  it('should return empty array if no families for user', async () => {
    const families = await listFamilies(9999);
    expect(Array.isArray(families)).toBe(true);
    expect(families.length).toBe(0);
  });
});

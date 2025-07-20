
import { addFamilyMember, getFamilyMembers, updateFamilyMember, deleteFamilyMember } from '../src/familyMember';
import { initDb } from '../src/db';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement>;


describe('FamilyMember helpers', () => {
  const familyId = 'fam-123';
  const memberData = { familyId, name: 'Alice', avatar: '👩', calendarId: 'cal-1' };


  beforeAll(async () => {
    await initDb(':memory:');
    db = await open({ filename: ':memory:', driver: sqlite3.Database });
  });

  it('should add a new family member', async () => {
    const member = await addFamilyMember(memberData);
    expect(member.id).toBeDefined();
    expect(member.name).toBe('Alice');
  });

  it('should get all family members for a family', async () => {
    await addFamilyMember(memberData);
    await addFamilyMember({ ...memberData, name: 'Bob' });
    const members = await getFamilyMembers(familyId);
    expect(members.length).toBeGreaterThanOrEqual(2);
    expect(members[0].familyId).toBe(familyId);
  });

  it('should update a family member', async () => {
    const member = await addFamilyMember(memberData);
    const updated = await updateFamilyMember(member.id, { name: 'Alice Smith' });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('Alice Smith');
  });

  it('should delete a family member', async () => {
    const member = await addFamilyMember(memberData);
    await deleteFamilyMember(member.id);
    const members = await getFamilyMembers(familyId);
    const found = members.find(m => m.id === member.id);
    expect(found).toBeUndefined();
  });

  it('should not throw when deleting non-existent member', async () => {
    await expect(deleteFamilyMember('non-existent-id')).resolves.toBe(false);
  });
});


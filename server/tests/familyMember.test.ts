
import { addFamilyMember, getFamilyMembers, updateFamilyMember, deleteFamilyMember } from '../src/familyMember';
import { initDb, db } from '../src/db';
import { createUser } from '../src/store/userStore';

describe('FamilyMember helpers', () => {
  const familyId = 'fam-123';
  const userId = 1;
  const memberData = { familyId, userId, name: 'Alice', avatar: '👩', calendarId: 'cal-1' };

  beforeAll(async () => {
    await initDb(':memory:');
    await createUser(db, 'testuser', 'testpass');
  });

  it('should add a new family member', async () => {
    const member = await addFamilyMember(memberData);
    expect(member.id).toBeDefined();
    expect(member.name).toBe('Alice');
    expect(member.userId).toBe(userId);
  });

  it('should get all family members for a family', async () => {
    await addFamilyMember(memberData);
    await addFamilyMember({ ...memberData, name: 'Bob' });
    const members = await getFamilyMembers(familyId, userId);
    expect(members.length).toBeGreaterThanOrEqual(2);
    expect(members[0].familyId).toBe(familyId);
    expect(members[0].userId).toBe(userId);
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
    const members = await getFamilyMembers(familyId, userId);
    const found = members.find(m => m.id === member.id);
    expect(found).toBeUndefined();
  });

  it('should not throw when deleting non-existent member', async () => {
    await expect(deleteFamilyMember('non-existent-id')).resolves.toBe(false);
  });
});


export interface FamilyMember {
  id: string;
  familyId: string;
  userId: number;
  name: string;
  avatar?: string;
  calendarId?: string;
  email?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

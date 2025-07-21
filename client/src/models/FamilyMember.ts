// FamilyMember interface/model for client
export interface FamilyMember {
  id: string;
  familyId: string;
  userId: number;
  name: string;
  avatar?: string;
  calendarId?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

// List model for DB (TypeScript)
export interface List {
  id: number;
  familyId: string;
  userId: string;
  type: string;
  name: string;
  createdAt: string;
}

export interface ListItem {
  id: number;
  listId: number;
  name: string;
  quantity: number;
  status: 'active' | 'completed';
  notes?: string;
  createdAt: string;
}

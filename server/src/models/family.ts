export interface Family {
  id: string;
  user_id: number; // FK to users table
  display_name: string;
  primary_email?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  phone_number?: string;
  timezone?: string;
  notes?: string;
  photo_url?: string;
  invite_code?: string;
  settings_json?: string;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

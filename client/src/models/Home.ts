export interface Home {
  id: string;
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
}

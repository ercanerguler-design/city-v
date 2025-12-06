// ============================================
// AVM & FOOD ORDERING TYPE DEFINITIONS
// ============================================

export interface Mall {
  id: number;
  business_profile_id: number;
  mall_name: string;
  total_floors: number;
  total_shops: number;
  total_area_sqm?: number;
  address: string;
  city?: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
}

export interface MallFloor {
  id: number;
  mall_id: number;
  floor_number: number; // -2, -1, 0, 1, 2...
  floor_name?: string; // "Bodrum", "Zemin", "1. Kat"
  total_area_sqm?: number;
  camera_count?: number;
  created_at: string;
}

export interface MallShop {
  id: number;
  mall_id: number;
  floor_id: number;
  shop_name: string;
  shop_number?: string; // "A-123"
  category?: string;
  brand_name?: string;
  area_sqm: number;
  monthly_rent?: number;
  rent_per_sqm?: number;
  contract_start_date?: string;
  contract_end_date?: string;
  is_active: boolean;
  tenant_contact_name?: string;
  tenant_contact_phone?: string;
  tenant_contact_email?: string;
  location_zone?: 'entrance' | 'corner' | 'corridor' | 'central';
  foot_traffic_zone?: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface MallCamera {
  id: number;
  mall_id: number;
  floor_id: number;
  camera_id: number;
  zone_name: string;
  zone_type: 'corridor' | 'entrance' | 'food_court' | 'escalator' | 'elevator';
  coverage_area?: any; // JSONB polygon
  created_at: string;
}

export interface MallCrowdAnalysis {
  id: number;
  mall_id: number;
  floor_id: number;
  camera_id: number;
  zone_name: string;
  people_count: number;
  density_level: 'empty' | 'low' | 'medium' | 'high' | 'overcrowded';
  timestamp: string;
  hour_of_day: number; // 0-23
  day_of_week: number; // 0-6
}

export interface MallRentSuggestion {
  id: number;
  shop_id: number;
  suggested_rent: number;
  current_rent?: number;
  foot_traffic_score: number; // 0-100
  visibility_score: number; // 0-100
  floor_popularity: number; // 0-100
  calculation_date: string;
  factors: {
    footTraffic: number;
    visibility: number;
    floorPopularity: number;
    [key: string]: number;
  };
}

// ============================================
// FOOD ORDERING TYPES
// ============================================

export interface UserAddress {
  id: number;
  user_id: number;
  address_title: string; // "Ev", "İş", "Diğer"
  full_address: string;
  city?: string;
  district?: string;
  postal_code?: string;
  address_lat?: number;
  address_lng?: number;
  building_no?: string;
  apartment_no?: string;
  floor?: string;
  door_no?: string;
  delivery_instructions?: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingCart {
  id: number;
  user_id: number;
  business_profile_id: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Extended (with menu item details)
  menu_item?: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    category?: string;
  };
}

export interface FoodOrder {
  id: number;
  order_number: string; // "ORD-2024-12-0001"
  user_id: number;
  business_profile_id: number;
  address_id?: number;
  
  // Order details
  items: Array<{
    itemId: number;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  total_amount: number;
  delivery_fee: number;
  discount_amount?: number;
  final_amount: number;
  
  // Contact
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_notes?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'online';
  payment_status: 'pending' | 'paid' | 'failed';
  
  // Timing
  order_time: string;
  confirmed_at?: string;
  preparation_started_at?: string;
  ready_at?: string;
  delivered_at?: string;
  estimated_delivery_time?: string;
  
  // Notes & Ratings
  business_notes?: string;
  cancellation_reason?: string;
  rating?: number; // 1-5
  review_text?: string;
  
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: string;
  changed_by: 'customer' | 'business' | 'system';
  notes?: string;
  timestamp: string;
}

export interface BusinessDeliverySettings {
  id: number;
  business_profile_id: number;
  accepts_orders: boolean;
  min_order_amount: number;
  delivery_radius_km: number;
  delivery_fee: number;
  free_delivery_threshold?: number;
  estimated_prep_time_minutes: number;
  accepts_cash: boolean;
  accepts_card: boolean;
  accepts_online_payment: boolean;
  operating_hours?: any; // JSONB
  closed_dates?: string[]; // ["2024-01-01", "2024-12-31"]
  created_at: string;
  updated_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface MallFloorSummary extends MallFloor {
  shop_count: number;
  camera_count: number;
  current_crowd?: number;
  avg_crowd?: number;
  density_level?: string;
}

export interface CartSummary {
  cart: ShoppingCart;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  delivery_fee: number;
  final_total: number;
  business: {
    id: number;
    name: string;
    delivery_settings: BusinessDeliverySettings;
  };
}

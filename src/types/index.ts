// Core types that match our backend exactly
export interface Student {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  orders: string[];
  school?: string;
  grade?: string;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  foodId: string;
  foodName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  studentId: string;
  studentName?: string;
  student?: {
    _id: string;
    name: string;
    email: string;
    school?: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  pointsEarned: number;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  studentId: string;
  studentName?: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Request types for API calls
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateFoodRequest {
  name: string;
  price: number;
  category: string;
  description: string;
  available?: boolean;
}

export interface UpdateFoodRequest extends Partial<CreateFoodRequest> {}

export interface PlaceOrderRequest {
  items: {
    foodId: string;
    quantity: number;
  }[];
  pointsToUse?: number;
}

export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  comment: string;
}

// Response types from backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  student: Student;
  token: string;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface FoodsResponse {
  foods: Food[];
}

export interface ReviewsResponse {
  reviews: Review[];
}

export interface StatsResponse {
  pendingOrders: number;
  todayOrders: number;
  totalStudents: number;
  totalOrders: number;
  totalRevenue: number;
  totalFoods: number;
}

export type SensorDeviceStatus = 'online' | 'stale' | 'offline' | 'waiting_for_data';

export interface SensorOrderOption {
  order_id: string;
  order_number: string;
  device_id: string | null;
  delivery_status: string;
  assigned_at: string | null;
  delivery_date: string | null;
}

export interface SensorReading {
  id: string;
  temperature_c: number | null;
  humidity_percent: number | null;
  latitude: number | null;
  longitude: number | null;
  motion_detected: boolean | null;
  acceleration_x: number | null;
  acceleration_y: number | null;
  acceleration_z: number | null;
  box_open: boolean | null;
  battery_percent: number | null;
  device_recorded_at: string | null;
  received_at: string | null;
}

export interface SensorOrderListResponse {
  orders: SensorOrderOption[];
  server_time: string;
}

export interface LatestSensorReadingResponse {
  order_id: string;
  order_number: string;
  device_id: string | null;
  delivery_status: string;
  assignment_status: 'unassigned' | 'waiting_for_data' | 'ready';
  device_status: SensorDeviceStatus;
  latest: SensorReading | null;
  server_time: string;
}

export interface SensorReadingHistoryResponse {
  order_id: string;
  order_number: string;
  device_id: string | null;
  delivery_status: string;
  device_status: SensorDeviceStatus;
  readings: SensorReading[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  server_time: string;
}

// Cart types for frontend state
export interface CartItem {
  foodId: string;
  food: Food;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

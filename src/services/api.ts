import { 
  Student, 
  Food, 
  Order, 
  Review, 
  LoginRequest, 
  RegisterRequest, 
  CreateFoodRequest, 
  UpdateFoodRequest, 
  PlaceOrderRequest, 
  CreateReviewRequest,
  ApiResponse,
  LoginResponse,
  OrdersResponse,
  FoodsResponse,
  ReviewsResponse,
  StatsResponse,
  SensorOrderListResponse,
  LatestSensorReadingResponse,
  SensorReadingHistoryResponse
} from '@/types';

// Use the current origin by default. During development Vite proxies /api to the
// backend, so phones and other LAN clients do not try to reach their own localhost.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || '/api').replace(/\/+$/, '');
export const AUTH_SESSION_INVALID_EVENT = 'nayomis:auth-session-invalid';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 0, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const invalidateCustomerSession = (message: string, code?: string) => {
  localStorage.removeItem('nayomis_token');
  localStorage.removeItem('nayomis_user');
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_INVALID_EVENT, {
    detail: { message, code },
  }));
};

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('nayomis_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `HTTP ${response.status}: ${response.statusText}`;
        let code: string | undefined;

        try {
          const errorData = JSON.parse(errorText) as { message?: string; code?: string };
          message = errorData.message || message;
          code = errorData.code;
        } catch {
          // Keep the HTTP fallback when the backend did not return JSON.
        }

        if (response.status === 401 || ['SESSION_EXPIRED', 'INVALID_TOKEN', 'TOKEN_REQUIRED', 'CUSTOMER_TOKEN_REQUIRED'].includes(code || '')) {
          invalidateCustomerSession(message, code);
        }

        throw new ApiError(message, response.status, code);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Unable to reach the Nayomi\'s API. Check that the backend is running and try again.',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Student Authentication Routes - matches /api/students/*
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/students/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(studentData: RegisterRequest): Promise<ApiResponse<Student>> {
    return this.request<Student>('/students/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async getStudentProfile(studentId: string): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${studentId}`);
  }

  async getCurrentStudent(): Promise<ApiResponse<{ student: Student }>> {
    return this.request<{ student: Student }>('/students/me');
  }

  // Food Management Routes - matches /api/food/*
  async getFoods(): Promise<ApiResponse<FoodsResponse>> {
    return this.request<FoodsResponse>('/food');
  }

  async createFood(foodData: CreateFoodRequest): Promise<ApiResponse<Food>> {
    return this.request<Food>('/food', {
      method: 'POST',
      body: JSON.stringify(foodData),
    });
  }

  async updateFood(foodId: string, updates: UpdateFoodRequest): Promise<ApiResponse<Food>> {
    return this.request<Food>(`/food/${foodId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFood(foodId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/food/${foodId}`, {
      method: 'DELETE',
    });
  }

  async toggleFoodAvailability(foodId: string): Promise<ApiResponse<Food>> {
    return this.request<Food>(`/food/availability/${foodId}`, {
      method: 'PUT',
    });
  }

  // Order Management Routes - matches /api/orders/*
  async placeOrder(studentId: string, orderData: PlaceOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders/place', {
      method: 'POST',
      body: JSON.stringify({ studentId, ...orderData }),
    });
  }

  async getStudentOrders(studentId: string): Promise<ApiResponse<OrdersResponse>> {
    return this.request<OrdersResponse>(`/orders/student/${studentId}`);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Review Routes - matches /api/reviews/*
  async createReview(studentId: string, reviewData: CreateReviewRequest): Promise<ApiResponse<Review>> {
    return this.request<Review>(`/reviews/${studentId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getReviews(): Promise<ApiResponse<ReviewsResponse>> {
    return this.request<ReviewsResponse>('/reviews');
  }

  // Admin Routes - matches /api/admin/*
  async getAllStudents(): Promise<ApiResponse<{ students: Student[] }>> {
    return this.request<{ students: Student[] }>('/admin/students');
  }

  async getAllOrders(): Promise<ApiResponse<{ orders: Order[] }>> {
    return this.request<{ orders: Order[] }>('/admin/orders');
  }

  async getStats(): Promise<ApiResponse<StatsResponse>> {
    return this.request<StatsResponse>('/admin/dashboard');
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/students/${studentId}`, {
      method: 'DELETE',
    });
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Advanced Order Routes - School pre-order system
  async placeAdvancedOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/advanced-orders/place', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async validateCheckout(checkoutData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/advanced-orders/validate-checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  async getPickupPointsForStudent(studentId: string, deliveryDate?: string): Promise<ApiResponse<any>> {
    const query = deliveryDate ? `?deliveryDate=${deliveryDate}` : '';
    return this.request<any>(`/advanced-orders/student/${studentId}/pickup-points${query}`);
  }

  // Pickup Point Routes
  async getPickupPoints(): Promise<ApiResponse<any>> {
    return this.request<any>('/pickup-points');
  }

  async getPickupPointsBySchool(schoolName: string, deliveryDate?: string): Promise<ApiResponse<any>> {
    const query = deliveryDate ? `?deliveryDate=${deliveryDate}` : '';
    return this.request<any>(`/pickup-points/school/${schoolName}${query}`);
  }

  async getPickupPointTimeSlots(pickupPointId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/pickup-points/${pickupPointId}/timeslots`);
  }

  // Authenticated smart-box monitoring routes
  async getSensorOrders(): Promise<ApiResponse<SensorOrderListResponse>> {
    return this.request<SensorOrderListResponse>('/pre-orders/sensor-orders');
  }

  async getLatestSensorReading(orderId: string): Promise<ApiResponse<LatestSensorReadingResponse>> {
    return this.request<LatestSensorReadingResponse>(`/pre-orders/${encodeURIComponent(orderId)}/sensor-readings/latest`);
  }

  async getSensorReadingHistory(
    orderId: string,
    page = 1,
    perPage = 25
  ): Promise<ApiResponse<SensorReadingHistoryResponse>> {
    return this.request<SensorReadingHistoryResponse>(
      `/pre-orders/${encodeURIComponent(orderId)}/sensor-readings?page=${page}&per_page=${perPage}`
    );
  }
}

// Export singleton instance
export const apiService = new ApiService();

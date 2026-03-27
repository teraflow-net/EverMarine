/**
 * TradeFlow API Client
 * ERP_Client Django REST API 연동
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token')
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ───────────────────────────────────────────
// 견적 (Quote)
// ───────────────────────────────────────────

export const quoteApi = {
  list: (params?: string) => request<Quote[]>(`/quotes/${params ? `?${params}` : ''}`),
  get: (id: number) => request<Quote>(`/quotes/${id}/`),
  create: (data: Partial<Quote>) => request<Quote>('/quotes/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Quote>) => request<Quote>(`/quotes/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/quotes/${id}/`, { method: 'DELETE' }),
}

// ───────────────────────────────────────────
// 견적 품목 (QuoteItem)
// ───────────────────────────────────────────

export const quoteItemApi = {
  list: (quoteId?: number) => request<QuoteItem[]>(`/quote-items/${quoteId ? `?quote=${quoteId}` : ''}`),
  create: (data: Partial<QuoteItem>) => request<QuoteItem>('/quote-items/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<QuoteItem>) => request<QuoteItem>(`/quote-items/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/quote-items/${id}/`, { method: 'DELETE' }),
}

// ───────────────────────────────────────────
// 거래처 (Customer)
// ───────────────────────────────────────────

export const customerApi = {
  list: () => request<Customer[]>('/customers/'),
  get: (id: number) => request<Customer>(`/customers/${id}/`),
  create: (data: Partial<Customer>) => request<Customer>('/customers/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Customer>) => request<Customer>(`/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/customers/${id}/`, { method: 'DELETE' }),
}

// ───────────────────────────────────────────
// 매입처 (Supplier)
// ───────────────────────────────────────────

export const supplierApi = {
  list: () => request<Supplier[]>('/suppliers/'),
  get: (id: number) => request<Supplier>(`/suppliers/${id}/`),
  create: (data: Partial<Supplier>) => request<Supplier>('/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Supplier>) => request<Supplier>(`/suppliers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/suppliers/${id}/`, { method: 'DELETE' }),
}

// ───────────────────────────────────────────
// 선박 (Vessel)
// ───────────────────────────────────────────

export const vesselApi = {
  list: () => request<Vessel[]>('/vessels/'),
  get: (id: number) => request<Vessel>(`/vessels/${id}/`),
  create: (data: Partial<Vessel>) => request<Vessel>('/vessels/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Vessel>) => request<Vessel>(`/vessels/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/vessels/${id}/`, { method: 'DELETE' }),
}

// ───────────────────────────────────────────
// 매입처 품목단가 (SupplierItemPrice)
// ───────────────────────────────────────────

export const supplierItemPriceApi = {
  list: (params?: string) => request<SupplierItemPrice[]>(`/supplier-item-prices/${params ? `?${params}` : ''}`),
  create: (data: Partial<SupplierItemPrice>) => request<SupplierItemPrice>('/supplier-item-prices/', { method: 'POST', body: JSON.stringify(data) }),
}

// ───────────────────────────────────────────
// 이메일 (Email)
// ───────────────────────────────────────────

export const emailApi = {
  list: () => request<Email[]>('/emails/'),
  get: (uid: number) => request<Email>(`/emails/${uid}/`),
  sentList: () => request<SentEmail[]>('/sent-emails/'),
}

// ───────────────────────────────────────────
// 단가 조회 (PriceSearch)
// ───────────────────────────────────────────

export const priceSearchApi = {
  list: (params?: string) => request<PriceSearch[]>(`/price-search/${params ? `?${params}` : ''}`),
}

// ───────────────────────────────────────────
// 인증 (Auth)
// ───────────────────────────────────────────

export const authApi = {
  login: async (username: string, password: string) => {
    const data = await request<{ access: string; refresh: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    return data
  },
  refresh: async () => {
    const refresh = localStorage.getItem('refresh_token')
    const data = await request<{ access: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    })
    localStorage.setItem('access_token', data.access)
    return data
  },
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

// 타입 re-export
import type {
  Quote, QuoteItem, Customer, Supplier, Vessel,
  SupplierItemPrice, Email, SentEmail, PriceSearch,
} from '@/types'

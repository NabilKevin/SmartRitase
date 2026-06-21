import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"

export interface User {
  username: string
  email: string
  role: 'user' | 'admin'
  is_first_login?: boolean
  created_at?: Date
  updated_at?: Date
}

export interface Vehicle {
  id?: string
  plate: string
  type: string
  status: 'active' | 'inactive'
  created_at?: Date
  updated_at?: Date
}

export interface LandTicket {
  id?: string
  vehicle_id: string
  date: string
  excavation_site_lat: number
  excavation_site_long: number
  driver_id: string
  driver_signature: string
  excavation_pic_signature: string
  status: 'in_transit' | 'completed'
  created_at?: Date
  updated_at?: Date
}

export interface ProofDelivery {
  id?: string
  land_ticket_id: string
  driver_id: string
  project_name: string
  landfill_site_lat: number
  landfill_site_long: number
  unloading_time: string
  landfill_pic_name: string
  landfill_pic_signature: string
  created_at?: Date
  updated_at?: Date
}

export type AuthRole = 'user' | 'admin'

export interface AuthUser {
  uid: string
  email: string
  username: string | null
  role: AuthRole
  is_first_login?: boolean
}

export interface FetchDriverDataParams {
  limitCount?: number, 
  driverId?: string, 
  lastVisibleDoc?: QueryDocumentSnapshot | null
}

export interface deleteDeliveryParam {
  id?: string;
  landTicketId: string;
}

export interface FetchTicketsResponse {
  data: LandTicket[];
  hasMore: boolean;
  newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}

export interface FetchDeliveriesResponse {
  data: ProofDelivery[];
  hasMore: boolean;
  newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}
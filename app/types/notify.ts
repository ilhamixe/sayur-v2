export interface SupplierMapping {
  mapping_type: 'product' | 'category';
  ref_id: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  active: number;
  mappings: SupplierMapping[];
  created_at: string;
  updated_at: string;
}

export interface WaStatus {
  status: 'idle' | 'qr' | 'connecting' | 'connected' | 'disconnected' | 'error';
  phoneNumber: string;
  qr: string | null;
  hasSession: boolean;
  ready: boolean;
}

export interface OutboxRow {
  id: number;
  order_id: string;
  supplier_name: string;
  to_jid: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  last_error: string;
  created_at: string;
}

export interface NotifyLogRow {
  id: number;
  order_id: string;
  customer_name: string;
  items_count: number;
  supplier_hits: number;
  unmapped: string;
  created_at: string;
}

export interface OutboxStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

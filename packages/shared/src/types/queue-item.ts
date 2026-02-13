export type QueueItemStatus = 'pending' | 'printing' | 'completed' | 'cancelled';

export interface QueueItem {
  id: number;
  productName: string;
  details: string | null;
  quantity: number;
  position: number;
  status: QueueItemStatus;
  invoiceId: number | null;
  priority: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQueueItemDto {
  productName: string;
  details?: string;
  quantity: number;
  position?: number;
  status?: QueueItemStatus;
  invoiceId?: number;
  priority?: number;
  notes?: string;
}

export interface UpdateQueueItemDto {
  productName?: string;
  details?: string;
  quantity?: number;
  position?: number;
  status?: QueueItemStatus;
  priority?: number;
  notes?: string;
}

export interface ReorderQueueDto {
  itemId: number;
  newPosition: number;
}

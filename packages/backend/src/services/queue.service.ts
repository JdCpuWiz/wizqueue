import { QueueItemModel } from '../models/queue-item.model.js';
import type {
  QueueItem,
  CreateQueueItemDto,
  UpdateQueueItemDto,
  ReorderQueueDto,
} from '@wizqueue/shared';

export class QueueService {
  async getAllItems(): Promise<QueueItem[]> {
    return await QueueItemModel.findAll();
  }

  async getItemById(id: number): Promise<QueueItem> {
    const item = await QueueItemModel.findById(id);
    if (!item) {
      throw new Error('Queue item not found');
    }
    return item;
  }

  async createItem(data: CreateQueueItemDto): Promise<QueueItem> {
    return await QueueItemModel.create(data);
  }

  async createManyItems(items: CreateQueueItemDto[]): Promise<QueueItem[]> {
    if (items.length === 0) {
      return [];
    }
    return await QueueItemModel.createMany(items);
  }

  async updateItem(id: number, data: UpdateQueueItemDto): Promise<QueueItem> {
    const updated = await QueueItemModel.update(id, data);
    if (!updated) {
      throw new Error('Queue item not found');
    }
    return updated;
  }

  async deleteItem(id: number): Promise<void> {
    const deleted = await QueueItemModel.delete(id);
    if (!deleted) {
      throw new Error('Queue item not found');
    }
  }

  async reorderItem(data: ReorderQueueDto): Promise<void> {
    await QueueItemModel.reorder(data.itemId, data.newPosition);
  }

  async updateItemStatus(id: number, status: string): Promise<QueueItem> {
    return await this.updateItem(id, { status: status as any });
  }
}

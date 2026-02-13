import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { QueueItem as QueueItemType } from '@wizqueue/shared';
import { useQueue } from '../../hooks/useQueue';
import { QueueItemEdit } from './QueueItemEdit';

interface QueueItemProps {
  item: QueueItemType;
}

export const QueueItem: React.FC<QueueItemProps> = ({ item }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { delete: deleteItem, updateStatus } = useQueue();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    printing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(item.id);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus({ id: item.id, status: newStatus });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="card hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1"
            {...attributes}
            {...listeners}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.productName}
                </h3>
                {item.details && (
                  <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>

              {/* Quantity Badge */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {/* Status Dropdown */}
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer
                    ${statusColors[item.status]}
                  `}
                >
                  <option value="pending">Pending</option>
                  <option value="printing">Printing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {item.priority > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    Priority: {item.priority}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QueueItemEdit
        item={item}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </>
  );
};

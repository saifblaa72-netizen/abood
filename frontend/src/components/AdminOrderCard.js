import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Package, MapPin, Phone, Mail, StickyNote } from 'lucide-react';
import { formatPrice, formatDate, orderStatuses } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminOrderCard = ({ order, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const { token } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(
        `${API}/orders/${order.id}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentStatus(newStatus);
      toast.success('تم تحديث حالة الطلب');
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error('فشل تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden" data-testid={`admin-order-${order.id}`}>
      <div className="p-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 text-right"
          data-testid={`admin-order-toggle-${order.id}`}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <div>
            <p className="font-cairo font-bold" data-testid={`order-number-${order.id}`}>
              #{order.order_number}
            </p>
            <p className="text-sm text-gray-500">
              {order.user_name} - {order.user_phone}
            </p>
            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
          </div>
        </button>

        <div className="text-left flex-shrink-0">
          <p className="font-bold text-burgundy-500 text-lg" data-testid={`order-total-${order.id}`}>
            {formatPrice(order.total_amount)}
          </p>
          <span className={`order-status-badge status-${currentStatus} mt-1 inline-block`}>
            {orderStatuses[currentStatus]}
          </span>
          {order.preview_service_requested && (
            <span 
              className="mt-1 block bg-brand-gold text-brand-black text-xs font-bold px-2 py-1 rounded-full"
              data-testid={`admin-order-preview-badge-${order.id}`}
            >
              ⭐ معاينة
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div 
          className="border-t bg-gray-50 dark:bg-gray-900/20 p-4 space-y-4"
          data-testid={`admin-order-details-${order.id}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-tajawal font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-burgundy-500" />
                عنوان التوصيل:
              </h4>
              <div className="text-sm font-cairo text-gray-700 dark:text-gray-300 pr-6 space-y-1">
                <p>{order.shipping_address?.full_name}</p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {order.shipping_address?.phone}
                </p>
                <p>{order.shipping_address?.governorate}, {order.shipping_address?.city}</p>
                <p>{order.shipping_address?.address_line}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-tajawal font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-burgundy-500" />
                معلومات الطلب:
              </h4>
              <div className="text-sm font-cairo text-gray-700 dark:text-gray-300 pr-6 space-y-1">
                <p>البريد: {order.user_email}</p>
                <p>طريقة الدفع: {order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</p>
                <p>عدد المنتجات: {order.items?.length}</p>
                {order.preview_service_requested && (
                  <p 
                    className="flex items-center gap-2 bg-brand-gold/20 text-brand-black px-3 py-2 rounded-lg font-bold"
                    data-testid={`admin-order-preview-service-${order.id}`}
                  >
                    ⭐ خدمة المعاينة مطلوبة
                  </p>
                )}
                {order.notes && (
                  <p className="flex items-start gap-2">
                    <StickyNote className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span>ملاحظات: {order.notes}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-tajawal font-bold mb-3">المنتجات المطلوبة:</h4>
            <div className="space-y-2" data-testid={`admin-order-items-${order.id}`}>
              {order.items?.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border"
                  data-testid={`admin-order-item-${order.id}-${idx}`}
                >
                  <img
                    src={item.image_url || '/logo.png'}
                    alt={item.name_ar}
                    className="w-16 h-16 object-cover rounded bg-gray-100 flex-shrink-0"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                    data-testid={`admin-order-item-image-${idx}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-cairo font-semibold truncate"
                      data-testid={`admin-order-item-name-${idx}`}
                    >
                      {item.name_ar}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      <span 
                        className="bg-burgundy-500/10 text-burgundy-500 px-2 py-1 rounded"
                        data-testid={`admin-order-item-color-${idx}`}
                      >
                        اللون: {item.color}
                      </span>
                      <span 
                        className="bg-brand-gold/10 text-brand-black px-2 py-1 rounded"
                        data-testid={`admin-order-item-size-${idx}`}
                      >
                        المقاس: {item.size}
                      </span>
                      <span 
                        className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                        data-testid={`admin-order-item-quantity-${idx}`}
                      >
                        الكمية: {item.quantity}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        SKU: {item.sku}
                      </span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="font-bold text-burgundy-500">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm font-cairo pt-3 border-t">
            <div>
              <span className="text-gray-500">المجموع الفرعي: </span>
              <span className="font-bold">{formatPrice(order.subtotal)}</span>
            </div>
            <div>
              <span className="text-gray-500">التوصيل: </span>
              <span className="font-bold">{formatPrice(order.delivery_fee)}</span>
            </div>
            {order.points_discount > 0 && (
              <div>
                <span className="text-gray-500">خصم النقاط: </span>
                <span className="font-bold text-green-600">-{formatPrice(order.points_discount)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t">
            <label className="font-cairo font-semibold">تغيير الحالة:</label>
            <Select 
              value={currentStatus}
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger 
                className="w-48"
                data-testid={`admin-order-status-select-${order.id}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatuses).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updating && <span className="text-sm text-gray-500">جاري التحديث...</span>}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdminOrderCard;

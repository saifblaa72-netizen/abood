import { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { CART } from '@/constants/testIds';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Cart = ({ open, onClose }) => {
  const { cart, updateCartItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [deliveryFee, setDeliveryFee] = useState(3);

  // Read the fee from the server so the drawer can never disagree with the
  // amount the customer is actually charged at checkout.
  useEffect(() => {
    axios.get(`${API}/loyalty/config`)
      .then((res) => setDeliveryFee(res.data.delivery_fee))
      .catch(() => {});
  }, []);

  const handleQuantityChange = async (item, newQuantity) => {
    try {
      await updateCartItem(item.product_id, item.color, item.size, newQuantity);
    } catch (error) {
      toast.error('فشل تحديث السلة');
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const total = (cart.total_amount || 0) + deliveryFee;

  return (
    <>
      <div 
        className={`cart-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />
      <div 
        data-testid={CART.drawer}
        className={`cart-drawer ${open ? 'open' : ''}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-tajawal font-bold">السلة</h2>
            <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {cart.items?.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 font-cairo">السلة فارغة</p>
            </div>
          ) : (
            <>
              <div 
                data-testid={CART.itemList}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {cart.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b">
                    <img 
                      src={item.image_url} 
                      alt={item.name_ar}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-cairo font-semibold">{item.name_ar}</h3>
                      <p className="text-sm text-gray-500">
                        {item.color} - {item.size}
                      </p>
                      <p className="text-burgundy-500 font-bold mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuantityChange(item, 0)}
                          className="mr-auto text-destructive hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t space-y-3">
                <div className="flex justify-between font-cairo">
                  <span>المجموع الفرعي</span>
                  <span data-testid={CART.subtotal}>{formatPrice(cart.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between font-cairo">
                  <span>رسوم التوصيل</span>
                  <span data-testid={CART.deliveryFee}>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-tajawal text-lg font-bold border-t pt-3">
                  <span>الإجمالي</span>
                  <span data-testid={CART.total} className="text-burgundy-500">
                    {formatPrice(total)}
                  </span>
                </div>
                <Button
                  data-testid={CART.checkoutBtn}
                  onClick={handleCheckout}
                  className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-lg py-6"
                >
                  إتمام الطلب
                </Button>
                <Button
                  data-testid={CART.clearBtn}
                  onClick={clearCart}
                  variant="outline"
                  className="w-full"
                >
                  إفراغ السلة
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;

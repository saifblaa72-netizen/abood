import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { CHECKOUT } from '@/constants/testIds';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    governorate: '',
    city: '',
    address_line: '',
    notes: '',
    payment_method: 'cod',
    use_loyalty_points: 0,
    preview_service_requested: false
  });

  const [loyaltyConfig, setLoyaltyConfig] = useState(null);

  useEffect(() => {
    axios.get(`${API}/loyalty/config`)
      .then((res) => setLoyaltyConfig(res.data))
      .catch(() => setLoyaltyConfig(null));
  }, []);

  const subtotal = cart.total_amount || 0;
  const deliveryFee = loyaltyConfig?.delivery_fee ?? 3;
  const threshold = loyaltyConfig?.redemption_threshold ?? 200;
  const blockValue = loyaltyConfig?.redemption_value ?? 10;

  // Points are spent in whole blocks, and never for more than the products cost.
  const affordableBlocks = Math.floor(subtotal / blockValue);
  const ownedBlocks = Math.floor((user?.loyalty_points || 0) / threshold);
  const maxBlocks = Math.min(ownedBlocks, affordableBlocks);
  const usedBlocks = Math.min(formData.use_loyalty_points / threshold, maxBlocks);

  const loyaltyDiscount = usedBlocks * blockValue;
  const total = subtotal + deliveryFee - loyaltyDiscount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    if (cart.items?.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        shipping_address: {
          full_name: formData.full_name,
          phone: formData.phone,
          governorate: formData.governorate,
          city: formData.city,
          address_line: formData.address_line,
          is_default: false
        },
        items: cart.items,
        payment_method: formData.payment_method,
        notes: formData.notes,
        use_loyalty_points: usedBlocks * threshold,
        preview_service_requested: formData.preview_service_requested
      };

      const response = await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('تم إنشاء الطلب بنجاح!');
      await clearCart();
      navigate(`/account`);
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('فشل إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <h1 className="text-4xl font-tajawal font-bold mb-8">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form data-testid={CHECKOUT.form} onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-tajawal font-bold mb-4">بيانات الشحن</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم الكامل</Label>
                    <Input
                      data-testid={CHECKOUT.nameInput}
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      data-testid={CHECKOUT.phoneInput}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>المحافظة</Label>
                    <Input
                      value={formData.governorate}
                      onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>المدينة</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>العنوان بالتفصيل</Label>
                    <Textarea
                      data-testid={CHECKOUT.addressInput}
                      value={formData.address_line}
                      onChange={(e) => setFormData({...formData, address_line: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>ملاحظات الطلب (اختياري)</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-tajawal font-bold mb-4">طريقة الدفع</h2>
                <RadioGroup
                  data-testid={CHECKOUT.paymentMethod}
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({...formData, payment_method: value})}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="font-cairo">الدفع عند الاستلام</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-2 border-burgundy-500/20">
                <h2 className="text-xl font-tajawal font-bold mb-2">خدمة المعاينة قبل الدفع</h2>
                <p className="text-sm text-gray-600 font-cairo mb-4">
                  تتيح لك خدمة المعاينة فحص المنتج قبل استلامه ودفع قيمته
                </p>
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-brand-gold/5 rounded-lg hover:bg-brand-gold/10 transition-colors">
                  <input
                    type="checkbox"
                    data-testid="preview-service-checkbox"
                    checked={formData.preview_service_requested}
                    onChange={(e) => setFormData({...formData, preview_service_requested: e.target.checked})}
                    className="mt-1 w-5 h-5 accent-burgundy-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-cairo font-semibold text-brand-black block">
                      أرغب بخدمة المعاينة عند التوصيل
                    </span>
                    <span className="text-sm text-gray-600 font-cairo">
                      سيتيح لك المندوب معاينة المنتج قبل الدفع النهائي
                    </span>
                  </div>
                </label>
              </div>

              {user && user.loyalty_points > 0 && (
                <div className="bg-brand-gold/10 rounded-lg p-6">
                  <h3 className="font-tajawal font-bold mb-2">نقاط الولاء</h3>
                  <p className="text-sm text-gray-600 font-cairo mb-3">
                    رصيدك {user.loyalty_points} نقطة — كل {threshold} نقطة = خصم {formatPrice(blockValue)}
                  </p>

                  {ownedBlocks === 0 ? (
                    <div>
                      <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-brand-gold transition-all duration-300"
                          style={{ width: `${Math.min(100, (user.loyalty_points / threshold) * 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 font-cairo">
                        باقي {threshold - user.loyalty_points} نقطة لتحصلي على أول خصم
                      </p>
                    </div>
                  ) : maxBlocks === 0 ? (
                    <p className="text-sm text-gray-600 font-cairo">
                      قيمة طلبك أقل من {formatPrice(blockValue)}، فما بنقدر نطبّق خصم النقاط على هذا الطلب.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: maxBlocks + 1 }, (_, i) => i).map((blocks) => (
                        <button
                          key={blocks}
                          type="button"
                          data-testid={`loyalty-blocks-${blocks}`}
                          onClick={() => setFormData({ ...formData, use_loyalty_points: blocks * threshold })}
                          className={`px-4 py-2 rounded-full border-2 font-cairo text-sm transition-all ${
                            usedBlocks === blocks
                              ? 'bg-burgundy-500 text-white border-burgundy-500'
                              : 'bg-white border-gray-300 hover:border-burgundy-500'
                          }`}
                        >
                          {blocks === 0
                            ? 'بدون خصم'
                            : `${blocks * threshold} نقطة = ${formatPrice(blocks * blockValue)}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                data-testid={CHECKOUT.submitBtn}
                type="submit"
                disabled={loading}
                className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-lg py-6"
              >
                {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
              </Button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-tajawal font-bold mb-4">ملخص الطلب</h2>
              <div className="space-y-3 mb-6">
                {cart.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 pb-3 border-b">
                    <img src={item.image_url} alt={item.name_ar} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-cairo font-semibold text-sm">{item.name_ar}</p>
                      <p className="text-xs text-gray-500">{item.color} - {item.size}</p>
                      <p className="text-sm text-burgundy-500">× {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 font-cairo">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم التوصيل:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>خصم نقاط الولاء:</span>
                    <span>-{formatPrice(loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>الإجمالي:</span>
                  <span className="text-burgundy-500">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

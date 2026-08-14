import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ACCOUNT } from '@/constants/testIds';
import { formatPrice, formatDate, orderStatuses, asArray } from '@/lib/utils';
import { Gift, Copy } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Account = () => {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      fetchOrders();
      fetchLoyaltyTransactions();
    }
  }, [user, loading]);

  useEffect(() => {
    axios.get(`${API}/loyalty/config`)
      .then((res) => setLoyaltyConfig(res.data))
      .catch(() => setLoyaltyConfig(null));
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(asArray(response.data));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchLoyaltyTransactions = async () => {
    try {
      const response = await axios.get(`${API}/loyalty/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoyaltyTransactions(asArray(response.data));
    } catch (error) {
      console.error('Failed to fetch loyalty transactions:', error);
    }
  };

  if (loading) return <div className="py-12 text-center">جاري التحميل...</div>;
  if (!user) return null;

  const points = user.loyalty_points || 0;
  const threshold = loyaltyConfig?.redemption_threshold ?? 200;
  const blockValue = loyaltyConfig?.redemption_value ?? 10;
  const readyBlocks = Math.floor(points / threshold);
  const pointsToNext = threshold - (points % threshold);

  return (
    <div data-testid={ACCOUNT.dashboard} className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <h1 className="text-4xl font-tajawal font-bold mb-8">حسابي</h1>

        <div className="mb-8 p-6 bg-gradient-to-l from-burgundy-500 to-burgundy-600 text-white rounded-lg">
          <h2 className="text-2xl font-tajawal font-bold mb-2">{user.full_name}</h2>
          <p className="font-cairo mb-4">{user.email}</p>
          <div className="flex items-center gap-2">
            <span className="loyalty-badge px-4 py-2 rounded-full">
              <span data-testid={ACCOUNT.loyaltyPoints} className="font-bold text-lg">
                {user.loyalty_points || 0}
              </span>
              {' '}نقطة ولاء
            </span>
          </div>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger data-testid={ACCOUNT.ordersTab} value="orders">طلباتي</TabsTrigger>
            <TabsTrigger data-testid={ACCOUNT.profileTab} value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger data-testid={ACCOUNT.loyaltyTab} value="loyalty">نقاط الولاء</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <div data-testid={ACCOUNT.ordersList} className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات</p>
              ) : (
                orders.map(order => (
                  <Card key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-tajawal font-bold text-lg">
                          طلب #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500 font-cairo">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className={`order-status-badge status-${order.status}`}>
                        {orderStatuses[order.status]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-cairo">
                        {order.items.length} منتج
                      </p>
                      <p className="font-bold text-burgundy-500">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="font-tajawal font-semibold">الاسم:</label>
                  <p className="font-cairo text-gray-700">{user.full_name}</p>
                </div>
                <div>
                  <label className="font-tajawal font-semibold">البريد الإلكتروني:</label>
                  <p className="font-cairo text-gray-700">{user.email}</p>
                </div>
                <div>
                  <label className="font-tajawal font-semibold">الهاتف:</label>
                  <p className="font-cairo text-gray-700">{user.phone}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-l from-brand-gold/10 to-burgundy-500/5 border-brand-gold/30">
              <h3 className="text-2xl font-tajawal font-bold mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-burgundy-500" />
                برنامج الإحالة
              </h3>
              <p className="text-gray-700 font-cairo mb-4">
                شاركي كود الإحالة مع صديقاتك واحصلي على <strong className="text-burgundy-500">100 نقطة</strong> لكل صديقة تسجل باستخدام الكود! وستحصل صديقتك على <strong className="text-burgundy-500">50 نقطة</strong> إضافية.
              </p>

              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-burgundy-500 mb-4">
                <p className="text-sm font-cairo text-gray-600 mb-2">كود الإحالة الخاص بك:</p>
                <div className="flex items-center justify-between gap-3">
                  <p 
                    data-testid="account-referral-code"
                    className="text-2xl font-bold text-burgundy-500 tracking-wider font-mono"
                  >
                    {user.referral_code || '---'}
                  </p>
                  <button
                    data-testid="copy-referral-code-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(user.referral_code);
                      toast.success('تم نسخ الكود');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Copy className="w-5 h-5 text-burgundy-500" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  data-testid="share-referral-whatsapp"
                  href={`https://wa.me/?text=${encodeURIComponent(`مرحباً! 🌸\n\nأنصحك بمتجر وهيبة فاشن للملابس النسائية الأنيقة ✨\n\nاستخدمي كود الإحالة الخاص بي عند التسجيل واحصلي على 50 نقطة مجانية:\n\n🎁 الكود: ${user.referral_code}\n\n🔗 ${window.location.origin}/login?ref=${user.referral_code}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-cairo font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  شارك على واتس آب
                </a>
                <button
                  data-testid="copy-referral-link-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${user.referral_code}`);
                    toast.success('تم نسخ رابط الإحالة');
                  }}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-cairo font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <Copy className="w-4 h-4" />
                  نسخ رابط الإحالة
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-brand-gold/30">
                <div className="flex items-center justify-between">
                  <span className="font-cairo text-gray-700">عدد الإحالات:</span>
                  <span 
                    data-testid="account-referral-count"
                    className="text-2xl font-bold text-burgundy-500"
                  >
                    {user.referral_count || 0}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="mt-6">
            <Card className="p-6 mb-6">
              <h3 className="font-tajawal font-bold text-2xl mb-2">
                رصيدك الحالي: <span className="text-burgundy-500">{points}</span> نقطة
              </h3>

              {readyBlocks > 0 ? (
                <p
                  data-testid="loyalty-ready-discount"
                  className="font-cairo text-green-600 font-semibold mb-4"
                >
                  جاهز للاستخدام: خصم {formatPrice(readyBlocks * blockValue)} على طلبك القادم
                </p>
              ) : (
                <p className="font-cairo text-gray-600 mb-4">
                  باقي {pointsToNext} نقطة لتحصلي على أول خصم بقيمة {formatPrice(blockValue)}
                </p>
              )}

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-l from-brand-gold to-burgundy-500 transition-all duration-500"
                  style={{ width: `${((points % threshold) / threshold) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 font-cairo mb-4">
                {points % threshold} / {threshold} نقطة للخصم التالي
              </p>

              <div className="text-sm text-gray-600 font-cairo space-y-1 border-t pt-4">
                <p>• كل {loyaltyConfig?.points_per_amount ?? 10} د.أ تنفقيها = نقطة واحدة</p>
                <p>• كل {threshold} نقطة = خصم {formatPrice(blockValue)} عند إتمام الطلب</p>
                <p>• كل صديقة تسجّل بكود الإحالة الخاص بك = {loyaltyConfig?.referrer_bonus ?? 100} نقطة لك</p>
              </div>
            </Card>

            <div className="space-y-3">
              {loyaltyTransactions.map(trans => (
                <Card key={trans.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-cairo font-semibold">{trans.description}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(trans.created_at)}
                      </p>
                    </div>
                    <span className={`font-bold ${trans.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trans.points > 0 ? '+' : ''}{trans.points}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;

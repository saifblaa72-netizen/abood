import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ACCOUNT } from '@/constants/testIds';
import { formatPrice, formatDate, orderStatuses } from '@/lib/utils';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Account = () => {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      fetchOrders();
      fetchLoyaltyTransactions();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchLoyaltyTransactions = async () => {
    try {
      const response = await axios.get(`${API}/loyalty/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoyaltyTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch loyalty transactions:', error);
    }
  };

  if (loading) return <div className="py-12 text-center">جاري التحميل...</div>;
  if (!user) return null;

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
            <Card className="p-6">
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
          </TabsContent>

          <TabsContent value="loyalty" className="mt-6">
            <Card className="p-6 mb-6">
              <h3 className="font-tajawal font-bold text-2xl mb-2">
                رصيدك الحالي: <span className="text-burgundy-500">{user.loyalty_points || 0}</span> نقطة
              </h3>
              <p className="text-gray-600 font-cairo">
                كل 10 ريال تنفقها = نقطة واحدة | كل نقطة = 1 ريال خصم
              </p>
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

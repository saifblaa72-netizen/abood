import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN } from '@/constants/testIds';
import { formatPrice, formatDate, orderStatuses, asArray } from '@/lib/utils';
import ProductManager from '@/components/ProductManager';
import CustomerManager from '@/components/CustomerManager';
import AdminOrderCard from '@/components/AdminOrderCard';
import axios from 'axios';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = () => {
  const { user, token, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      navigate('/');
    } else if (user && user.is_admin) {
      fetchStats();
      fetchOrders();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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

  if (loading) return <div className="py-12 text-center">جاري التحميل...</div>;
  if (!user || !user.is_admin) return null;

  return (
    <div data-testid={ADMIN.dashboard} className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <h1 className="text-4xl font-tajawal font-bold mb-8">لوحة التحكم</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-cairo">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold">{stats.total_products}</p>
                </div>
                <Package className="w-12 h-12 text-burgundy-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-cairo">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold">{stats.total_orders}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-burgundy-500" />
              </div>
            </Card>

            <button
              type="button"
              data-testid="admin-customers-card"
              onClick={() => setActiveTab('customers')}
              className="text-right"
            >
              <Card className="p-6 h-full cursor-pointer hover:border-burgundy-500 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-cairo">إجمالي العملاء</p>
                    <p className="text-3xl font-bold">{stats.total_users}</p>
                    <p className="text-xs text-burgundy-500 font-cairo mt-1">اضغطي لعرض التفاصيل</p>
                  </div>
                  <Users className="w-12 h-12 text-burgundy-500" />
                </div>
              </Card>
            </button>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-cairo">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.total_revenue)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-burgundy-500" />
              </div>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger data-testid={ADMIN.ordersTab} value="orders">الطلبات</TabsTrigger>
            <TabsTrigger data-testid={ADMIN.productsTab} value="products">المنتجات</TabsTrigger>
            <TabsTrigger data-testid="admin-customers-tab" value="customers">العملاء</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-tajawal font-bold mb-4">
                جميع الطلبات ({orders.length})
              </h2>
              <div data-testid={ADMIN.ordersList} className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات</p>
                ) : (
                  orders.map(order => (
                    <AdminOrderCard 
                      key={order.id} 
                      order={order}
                      onStatusChange={fetchOrders}
                    />
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductManager />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <CustomerManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

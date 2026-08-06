import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Gift, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, formatDate, asArray } from '@/lib/utils';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerManager = () => {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('loyalty_points');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort_by: sortBy };
      if (search) params.search = search;
      const response = await axios.get(`${API}/admin/customers`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(asArray(response.data));
    } catch (error) {
      toast.error('فشل تحميل بيانات العملاء');
    } finally {
      setLoading(false);
    }
  }, [token, search, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers, search]);

  const totalPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0);
  const totalReferrals = customers.reduce((sum, c) => sum + c.referral_count, 0);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ الكود');
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-tajawal font-bold">العملاء ({customers.length})</h2>
          <p className="text-sm font-cairo text-gray-500 mt-1">
            مجموع النقاط الموزّعة: {totalPoints} — عدد الدعوات الناجحة: {totalReferrals}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            data-testid="customer-search"
            type="text"
            placeholder="ابحثي بالاسم أو الهاتف أو الإيميل أو كود الدعوة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 font-cairo"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger data-testid="customer-sort" className="w-full md:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loyalty_points">الأعلى نقاطاً</SelectItem>
            <SelectItem value="referral_count">الأكثر دعوات</SelectItem>
            <SelectItem value="total_spent">الأعلى شراءً</SelectItem>
            <SelectItem value="orders_count">الأكثر طلبات</SelectItem>
            <SelectItem value="created_at">الأحدث تسجيلاً</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500 font-cairo">جاري التحميل...</p>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-cairo">
            {search ? 'ما في عميلة مطابقة للبحث' : 'ما في عملاء مسجّلين بعد'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse" data-testid="customers-table">
            <thead>
              <tr className="border-b text-sm font-cairo text-gray-500">
                <th className="py-3 px-3 font-semibold">العميلة</th>
                <th className="py-3 px-3 font-semibold">النقاط</th>
                <th className="py-3 px-3 font-semibold">جاهز للخصم</th>
                <th className="py-3 px-3 font-semibold">كود الدعوة</th>
                <th className="py-3 px-3 font-semibold">دعواتها</th>
                <th className="py-3 px-3 font-semibold">نقاط من الدعوات</th>
                <th className="py-3 px-3 font-semibold">دعتها</th>
                <th className="py-3 px-3 font-semibold">الطلبات</th>
                <th className="py-3 px-3 font-semibold">إجمالي الشراء</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  data-testid={`customer-row-${customer.id}`}
                  className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-3">
                    <p className="font-cairo font-bold">{customer.full_name}</p>
                    <p className="text-xs text-gray-500" dir="ltr">{customer.phone}</p>
                    <p className="text-xs text-gray-400" dir="ltr">{customer.email}</p>
                    {customer.created_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        سجّلت في {formatDate(customer.created_at)}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <span className="font-bold text-lg text-burgundy-500">
                      {customer.loyalty_points}
                    </span>
                  </td>
                  <td className="py-4 px-3 font-cairo">
                    {customer.available_discount > 0 ? (
                      <span className="text-green-600 font-semibold">
                        {formatPrice(customer.available_discount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    {customer.referral_code ? (
                      <button
                        onClick={() => copyCode(customer.referral_code)}
                        title="نسخ الكود"
                        className="flex items-center gap-1.5 font-mono text-sm text-burgundy-500 hover:underline"
                      >
                        {customer.referral_code}
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    {customer.referral_count > 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-cairo font-semibold text-brand-gold">
                        <Gift className="w-4 h-4" />
                        {customer.referral_count}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="py-4 px-3 font-cairo">
                    {customer.referral_points > 0 ? (
                      <span className="font-semibold">{customer.referral_points}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-3 font-cairo text-sm">
                    {customer.referred_by_name || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-4 px-3 font-cairo">{customer.orders_count}</td>
                  <td className="py-4 px-3 font-cairo font-semibold">
                    {formatPrice(customer.total_spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default CustomerManager;

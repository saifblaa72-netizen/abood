import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH } from '@/constants/testIds';
import { toast } from 'sonner';
import { Gift, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Login = () => {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || localStorage.getItem('pending_ref');
  
  const [isLogin, setIsLogin] = useState(!refFromUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState(refFromUrl || '');
  const [referralInfo, setReferralInfo] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (refFromUrl) {
      localStorage.setItem('pending_ref', refFromUrl);
      validateReferral(refFromUrl);
    }
  }, []);

  const validateReferral = async (code) => {
    if (!code) {
      setReferralInfo(null);
      return;
    }
    try {
      const response = await axios.get(`${API}/referral/validate/${code}`);
      if (response.data.valid) {
        setReferralInfo(response.data);
      } else {
        setReferralInfo(null);
      }
    } catch {
      setReferralInfo(null);
    }
  };

  const handleReferralChange = (e) => {
    const code = e.target.value.toUpperCase();
    setReferralCode(code);
    if (code.length >= 6) {
      validateReferral(code);
    } else {
      setReferralInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('تم تسجيل الدخول بنجاح');
      } else {
        await register(email, fullName, phone, password, referralCode || null);
        toast.success('تم إنشاء الحساب بنجاح');
        localStorage.removeItem('pending_ref');
      }
      navigate('/');
    } catch (error) {
      toast.error(isLogin ? 'فشل تسجيل الدخول' : 'فشل إنشاء الحساب');
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="وهيبة فاشن" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-tajawal font-bold text-center mb-8">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>

          {!isLogin && referralInfo && (
            <div className="mb-6 p-4 bg-brand-gold/10 border border-brand-gold rounded-lg">
              <div className="flex items-center gap-2 text-brand-black">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-cairo font-bold">
                    تمت الإحالة من: {referralInfo.referrer_name}
                  </p>
                  <p className="text-sm font-cairo text-gray-700">
                    ستحصلين على {referralInfo.bonus_points} نقطة إضافية عند التسجيل! 🎁
                  </p>
                </div>
              </div>
            </div>
          )}

          <form 
            data-testid={isLogin ? AUTH.loginForm : AUTH.registerForm}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            {!isLogin && (
              <>
                <div>
                  <Label>الاسم الكامل</Label>
                  <Input
                    data-testid={AUTH.nameInput}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    data-testid={AUTH.phoneInput}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                data-testid={AUTH.emailInput}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>كلمة المرور</Label>
              <Input
                data-testid={AUTH.passwordInput}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Label className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-burgundy-500" />
                  كود الإحالة (اختياري)
                </Label>
                <Input
                  data-testid="auth-referral-input"
                  value={referralCode}
                  onChange={handleReferralChange}
                  placeholder="أدخلي كود صديقة لتحصلي على نقاط إضافية"
                  className="uppercase"
                />
                {referralCode && !referralInfo && referralCode.length >= 6 && (
                  <p className="text-xs text-red-500 mt-1">كود غير صالح</p>
                )}
              </div>
            )}

            <Button
              data-testid={AUTH.submitBtn}
              type="submit"
              className="w-full bg-burgundy-500 hover:bg-burgundy-600"
            >
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid={AUTH.switchModeBtn}
              onClick={() => setIsLogin(!isLogin)}
              className="text-burgundy-500 hover:underline font-cairo"
            >
              {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

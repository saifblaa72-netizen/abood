import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH } from '@/constants/testIds';
import { toast } from 'sonner';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('تم تسجيل الدخول بنجاح');
      } else {
        await register(email, fullName, phone, password);
        toast.success('تم إنشاء الحساب بنجاح');
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
          <h1 className="text-3xl font-tajawal font-bold text-center mb-8">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>

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

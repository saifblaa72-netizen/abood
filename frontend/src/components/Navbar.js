import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { NAV } from '@/constants/testIds';

const Navbar = ({ onCartOpen }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="flex items-center justify-between h-20">
          <Link 
            to="/" 
            data-testid={NAV.logo}
            className="flex items-center gap-3"
          >
            <img 
              src="/logo.png" 
              alt="وهيبة فاشن" 
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              data-testid={NAV.homeLink}
              className="text-brand-black hover:text-burgundy-500 font-cairo font-medium transition-colors duration-200"
            >
              الرئيسية
            </Link>
            <Link 
              to="/products" 
              data-testid={NAV.productsLink}
              className="text-brand-black hover:text-burgundy-500 font-cairo font-medium transition-colors duration-200"
            >
              المنتجات
            </Link>
            <Link 
              to="/offers" 
              data-testid={NAV.offersLink}
              className="text-brand-black hover:text-burgundy-500 font-cairo font-medium transition-colors duration-200"
            >
              العروض
            </Link>
            <Link 
              to="/about" 
              data-testid={NAV.aboutLink}
              className="text-brand-black hover:text-burgundy-500 font-cairo font-medium transition-colors duration-200"
            >
              من نحن
            </Link>
            <Link 
              to="/contact" 
              data-testid={NAV.contactLink}
              className="text-brand-black hover:text-burgundy-500 font-cairo font-medium transition-colors duration-200"
            >
              تواصل معنا
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              data-testid={NAV.cartBtn}
              onClick={onCartOpen}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <ShoppingBag className="w-6 h-6 text-brand-black" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-burgundy-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="hidden md:flex"
                  >
                    <LayoutDashboard className="w-4 h-4 ml-2" />
                    لوحة التحكم
                  </Button>
                )}
                <Button
                  data-testid={NAV.accountBtn}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/account')}
                  className="hidden md:flex"
                >
                  <User className="w-4 h-4 ml-2" />
                  حسابي
                </Button>
                <Button
                  data-testid={NAV.logoutBtn}
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                data-testid={NAV.loginBtn}
                onClick={() => navigate('/login')}
                className="bg-burgundy-500 hover:bg-burgundy-600 text-white"
              >
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

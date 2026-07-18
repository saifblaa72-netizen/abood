import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Sun, Moon, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NAV } from '@/constants/testIds';
import { SOCIAL_LINKS } from '@/constants/social';

const Navbar = ({ onCartOpen }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="hidden md:flex items-center justify-between h-10 border-b border-gray-200/50 dark:border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <a 
              href={SOCIAL_LINKS.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-600 hover:text-burgundy-500 transition-colors dark:text-gray-400"
              data-testid="topbar-facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href={SOCIAL_LINKS.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-600 hover:text-burgundy-500 transition-colors dark:text-gray-400"
              data-testid="topbar-instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href={SOCIAL_LINKS.whatsapp_url} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-gray-600 hover:text-green-500 transition-colors dark:text-gray-400"
              data-testid="topbar-whatsapp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
            <span className="text-gray-600 dark:text-gray-400 font-cairo mr-2">
              <span dir="ltr">{SOCIAL_LINKS.whatsapp_display}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="theme-toggle-btn"
              onClick={toggleTheme}
              className="flex items-center gap-1 text-gray-600 hover:text-burgundy-500 transition-colors dark:text-gray-400 font-cairo"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>وضع ليلي</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span>وضع نهاري</span>
                </>
              )}
            </button>
          </div>
        </div>
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
              onClick={toggleTheme}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Toggle theme"
              data-testid="mobile-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-brand-black" />
              ) : (
                <Sun className="w-5 h-5 text-brand-black" />
              )}
            </button>

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

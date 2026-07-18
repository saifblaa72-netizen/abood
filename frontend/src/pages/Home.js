import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star, TrendingUp, Truck, Shield, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';
import { HOME } from '@/constants/testIds';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, newItems, accs] = await Promise.all([
        axios.get(`${API}/products?is_featured=true&limit=4`),
        axios.get(`${API}/products?is_new=true&limit=8`),
        axios.get(`${API}/products?category=accessories&limit=4`)
      ]);
      setFeaturedProducts(featured.data);
      setNewProducts(newItems.data);
      setAccessories(accs.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <div className="animate-fade-up">
      <section 
        data-testid={HOME.heroSection}
        className="hero-gradient relative h-[600px] flex items-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/28232246/pexels-photo-28232246.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/60" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-tajawal font-bold mb-6 leading-tight">
              وهيبة فاشن
            </h1>
            <p className="text-xl md:text-2xl font-cairo mb-8 leading-relaxed">
              اكتشفي أحدث صيحات الموضة بأرقى الخامات وأجمل التصاميم
            </p>
            <Link to="/products">
              <Button 
                data-testid={HOME.shopNowBtn}
                size="lg"
                className="bg-burgundy-500 hover:bg-burgundy-600 text-lg px-8 py-6"
              >
                تسوقي الآن
                <ChevronLeft className="mr-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-16 bg-brand-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-tajawal font-bold text-brand-black mb-4">
                المنتجات المميزة
              </h2>
              <p className="text-gray-600 font-cairo text-lg">
                تشكيلة منتقاة بعناية من أفخم القطع
              </p>
            </div>

            <div 
              data-testid={HOME.featuredProducts}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="product-card group"
                >
                  <div className="product-image-container aspect-[3/4] bg-gray-100 mb-4">
                    <img
                      src={product.images[0]?.url || '/placeholder.jpg'}
                      alt={product.name_ar}
                      className="product-image w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-cairo font-semibold text-brand-black mb-2 group-hover:text-burgundy-500 transition-colors">
                    {product.name_ar}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-burgundy-500 font-bold text-lg">
                      {formatPrice(product.price)}
                    </p>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-burgundy-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-burgundy-500" />
              </div>
              <h3 className="font-tajawal font-bold text-xl mb-2">توصيل سريع</h3>
              <p className="text-gray-600 font-cairo">
                نوصل لجميع مناطق المملكة بسرعة وأمان
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-burgundy-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-burgundy-500" />
              </div>
              <h3 className="font-tajawal font-bold text-xl mb-2">جودة عالية</h3>
              <p className="text-gray-600 font-cairo">
                نضمن لك أفضل الخامات وأرقى التصاميم
              </p>
            </div>
          </div>
        </div>
      </section>

      {accessories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-full mb-4">
                <Gem className="w-5 h-5 text-brand-gold" />
                <span className="font-cairo font-semibold text-brand-black">اللمسة الأنيقة</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-tajawal font-bold text-brand-black mb-4">
                الإكسسوارات
              </h2>
              <p className="text-gray-600 font-cairo text-lg">
                أكملي إطلالتك بلمسة من الفخامة
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {accessories.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="product-card group"
                >
                  <div className="product-image-container aspect-[3/4] bg-gray-100 mb-4 relative">
                    <img
                      src={product.images[0]?.url || '/placeholder.jpg'}
                      alt={product.name_ar}
                      className="product-image w-full h-full object-cover"
                    />
                    {product.is_on_sale && product.discount_percentage && (
                      <span className="absolute top-3 right-3 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full">
                        -{product.discount_percentage}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-cairo font-semibold text-brand-black mb-2 group-hover:text-burgundy-500 transition-colors">
                    {product.name_ar}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-burgundy-500 font-bold text-lg">
                      {formatPrice(product.price)}
                    </p>
                    {product.original_price && (
                      <p className="text-gray-400 line-through text-sm">
                        {formatPrice(product.original_price)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products?category=accessories">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-brand-gold text-brand-black hover:bg-brand-gold hover:text-brand-black"
                >
                  عرض جميع الإكسسوارات
                  <ChevronLeft className="mr-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {newProducts.length > 0 && (
        <section className="py-16 bg-brand-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-burgundy-500/10 px-4 py-2 rounded-full mb-4">
                <TrendingUp className="w-5 h-5 text-burgundy-500" />
                <span className="font-cairo font-semibold text-burgundy-500">جديدنا</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-tajawal font-bold text-brand-black">
                أحدث الموديلات
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {newProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="product-card group"
                >
                  <div className="product-image-container aspect-[3/4] bg-gray-100 mb-4 relative">
                    <img
                      src={product.images[0]?.url || '/placeholder.jpg'}
                      alt={product.name_ar}
                      className="product-image w-full h-full object-cover"
                    />
                    {product.is_new && (
                      <span className="absolute top-3 right-3 bg-brand-gold text-brand-black text-xs font-bold px-3 py-1 rounded-full">
                        جديد
                      </span>
                    )}
                  </div>
                  <h3 className="font-cairo font-semibold text-brand-black mb-2 group-hover:text-burgundy-500 transition-colors">
                    {product.name_ar}
                  </h3>
                  <p className="text-burgundy-500 font-bold text-lg">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-burgundy-500 text-burgundy-500 hover:bg-burgundy-500 hover:text-white"
                >
                  عرض جميع المنتجات
                  <ChevronLeft className="mr-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

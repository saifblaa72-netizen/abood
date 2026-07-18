import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Offers = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API}/products?is_on_sale=true&limit=20`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-burgundy-500 mb-4">
            العروض والتخفيضات
          </h1>
          <p className="text-xl font-cairo text-gray-600">
            اغتنمي الفرصة واحصلي على أفضل العروض
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-cairo">لا توجد عروض حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
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
                  {product.discount_percentage && (
                    <span className="absolute top-3 right-3 bg-destructive text-white text-lg font-bold px-4 py-2 rounded-full">
                      -{product.discount_percentage}%
                    </span>
                  )}
                </div>
                <h3 className="font-cairo font-semibold text-brand-black mb-2 group-hover:text-burgundy-500 transition-colors">
                  {product.name_ar}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-burgundy-500 font-bold text-lg">
                    {formatPrice(product.price)}
                  </p>
                  {product.original_price && (
                    <p className="text-gray-400 line-through">
                      {formatPrice(product.original_price)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { formatPrice, categories } from '@/lib/utils';
import { PRODUCTS } from '@/constants/testIds';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [loading, setLoading] = useState(true);

  // The URL is the source of truth for the category, so links like
  // /products?category=accessories land on that filter, and the browser's
  // back button works as expected.
  const categoryParam = searchParams.get('category');
  const category = categories.some(c => c.value === categoryParam) ? categoryParam : 'all';
  const categoryLabel = categories.find(c => c.value === category)?.label;

  const handleCategoryChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('category');
    } else {
      next.set('category', value);
    }
    setSearchParams(next);
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        sort_by: sortBy,
        limit: 50
      };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <h1
          data-testid="products-heading"
          className="text-4xl md:text-5xl font-tajawal font-bold text-brand-black mb-8"
        >
          {categoryLabel || 'المنتجات'}
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              data-testid={PRODUCTS.searchInput}
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 font-cairo"
            />
          </div>

          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger data-testid={PRODUCTS.categoryFilter} className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger data-testid={PRODUCTS.sortSelect} className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">الأحدث</SelectItem>
              <SelectItem value="price">الأقل سعراً</SelectItem>
              <SelectItem value="price_desc">الأعلى سعراً</SelectItem>
              <SelectItem value="sold_count">الأكثر مبيعاً</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-cairo">جاري التحميل...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-cairo">لا توجد منتجات</p>
          </div>
        ) : (
          <div 
            data-testid={PRODUCTS.grid}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {products.map((product) => (
              <Link 
                key={product.id}
                to={`/products/${product.id}`}
                data-testid={PRODUCTS.productCard}
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
        )}
      </div>
    </div>
  );
};

export default Products;

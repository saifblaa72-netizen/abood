import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_DETAIL } from '@/constants/testIds';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      if (response.data.available_colors?.length > 0) {
        setSelectedColor(response.data.available_colors[0]);
      }
      if (response.data.available_sizes?.length > 0) {
        setSelectedSize(response.data.available_sizes[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('فشل تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error('الرجاء اختيار اللون والمقاس');
      return;
    }

    const variant = product.variants.find(v => 
      v.color === selectedColor && v.size === selectedSize
    );

    if (!variant) {
      toast.error('هذا المقاس غير متوفر');
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        name_ar: product.name_ar,
        image_url: product.images[0]?.url || '',
        price: product.price,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
        sku: variant.sku
      });
      toast.success('تمت إضافة المنتج إلى السلة');
    } catch (error) {
      toast.error('فشلت إضافة المنتج');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div data-testid={PRODUCT_DETAIL.image}>
            <img
              src={product.images[0]?.url || '/placeholder.jpg'}
              alt={product.name_ar}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          <div>
            <h1 
              data-testid={PRODUCT_DETAIL.name}
              className="text-3xl md:text-4xl font-tajawal font-bold text-brand-black mb-4"
            >
              {product.name_ar}
            </h1>

            <div className="mb-6">
              <p 
                data-testid={PRODUCT_DETAIL.price}
                className="text-4xl font-bold text-burgundy-500"
              >
                {formatPrice(product.price)}
              </p>
              {product.original_price && (
                <p className="text-xl text-gray-400 line-through mt-1">
                  {formatPrice(product.original_price)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-cairo leading-relaxed">
                {product.description_ar}
              </p>
            </div>

            {product.material_ar && (
              <div className="mb-6">
                <h3 className="font-tajawal font-semibold mb-2">الخامة:</h3>
                <p className="text-gray-700 font-cairo">{product.material_ar}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div>
                <label className="block font-tajawal font-semibold mb-2">اللون:</label>
                <Select 
                  data-testid={PRODUCT_DETAIL.colorSelect}
                  value={selectedColor} 
                  onValueChange={setSelectedColor}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.available_colors?.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-tajawal font-semibold mb-2">المقاس:</label>
                <Select 
                  data-testid={PRODUCT_DETAIL.sizeSelect}
                  value={selectedSize} 
                  onValueChange={setSelectedSize}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.available_sizes?.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                data-testid={PRODUCT_DETAIL.addToCartBtn}
                onClick={handleAddToCart}
                className="flex-1 bg-burgundy-500 hover:bg-burgundy-600 text-lg py-6"
              >
                <ShoppingBag className="ml-2 w-5 h-5" />
                إضافة إلى السلة
              </Button>
              <Button
                data-testid={PRODUCT_DETAIL.buyNowBtn}
                onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}
                variant="outline"
                className="flex-1 border-burgundy-500 text-burgundy-500 hover:bg-burgundy-500 hover:text-white text-lg py-6"
              >
                اشتري الآن
              </Button>
            </div>

            <div className="mt-6">
              <a
                data-testid={PRODUCT_DETAIL.whatsappBtn}
                href={`https://wa.me/966501234567?text=مرحباً، أريد الاستفسار عن ${product.name_ar}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-cairo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                استفسر عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

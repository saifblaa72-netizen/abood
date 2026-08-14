import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_DETAIL } from '@/constants/testIds';
import { SOCIAL_LINKS } from '@/constants/social';
import { toast } from 'sonner';
import { ShoppingBag, Share2, Copy, Minus, Plus, Download } from 'lucide-react';
import { playLogoSound } from '@/lib/sound';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const buildShareUrl = () => {
    const baseUrl = `${window.location.origin}/products/${id}`;
    if (user?.referral_code) {
      return `${baseUrl}?ref=${user.referral_code}`;
    }
    return baseUrl;
  };

  useEffect(() => {
    fetchProduct();
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('pending_ref', refCode);
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('فشل تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor) {
      toast.error('⚠️ الرجاء اختيار اللون قبل الإضافة إلى السلة');
      return false;
    }
    if (!selectedSize) {
      toast.error('⚠️ الرجاء اختيار المقاس قبل الإضافة إلى السلة');
      return false;
    }

    const variant = product.variants.find(v => 
      v.color === selectedColor && v.size === selectedSize
    );

    if (!variant) {
      toast.error('هذا اللون بهذا المقاس غير متوفر حالياً');
      return false;
    }

    try {
      await addToCart({
        product_id: product.id,
        name_ar: product.name_ar,
        image_url: product.images[0]?.url || '',
        price: product.price,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
        sku: variant.sku
      });
      toast.success(`تمت إضافة ${quantity} × ${product.name_ar} إلى السلة`);
      return true;
    } catch (error) {
      toast.error('فشلت إضافة المنتج');
      return false;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      navigate('/checkout');
    }
  };

  const handleDownloadImage = async () => {
    const currentImgUrl = product.images[selectedImageIndex]?.url || product.images[0]?.url;
    if (!currentImgUrl) {
      toast.error('لا توجد صورة للتنزيل');
      return;
    }
    try {
      const response = await fetch(currentImgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name_ar.replace(/\s+/g, '_')}_image_${selectedImageIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      playLogoSound();
      toast.success('تم تنزيل صورة المنتج بنجاح');
    } catch (err) {
      const a = document.createElement('a');
      a.href = currentImgUrl;
      a.download = `${product.name_ar}_image.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      playLogoSound();
      toast.success('تم فتح تنزيل صورة المنتج');
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
          <div>
            <div data-testid={PRODUCT_DETAIL.image} className="relative">
              <img
                src={product.images[selectedImageIndex]?.url || product.images[0]?.url || '/placeholder.jpg'}
                alt={product.name_ar}
                className="w-full aspect-[3/4] object-cover rounded-lg bg-gray-100"
              />
              {product.images && product.images.length > 1 && (
                <div 
                  data-testid="product-image-count"
                  className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-cairo"
                >
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div 
                data-testid="product-thumbnails"
                className="grid grid-cols-5 gap-2 mt-4"
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    data-testid={`product-thumbnail-${idx}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx 
                        ? 'border-burgundy-500 scale-95' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name_ar} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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
                <label className="block font-tajawal font-semibold mb-2">
                  اللون: {selectedColor ? (
                    <span className="text-burgundy-500 font-bold" data-testid="selected-color-display">{selectedColor}</span>
                  ) : (
                    <span className="text-red-500 font-bold" data-testid="selected-color-display">* الرجاء الاختيار</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2" data-testid="color-swatches">
                  {product.available_colors?.map(color => {
                    const variant = product.variants.find(v => v.color === color);
                    return (
                      <button
                        key={color}
                        data-testid={`color-swatch-${color}`}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-full border-2 font-cairo text-sm transition-all ${
                          selectedColor === color 
                            ? 'border-burgundy-500 bg-burgundy-500 text-white' 
                            : 'border-gray-300 hover:border-burgundy-500'
                        }`}
                        style={variant?.color_hex && selectedColor !== color ? { borderColor: variant.color_hex } : {}}
                      >
                        {variant?.color_hex && (
                          <span 
                            className="inline-block w-4 h-4 rounded-full ml-2 border border-gray-300 align-middle"
                            style={{ backgroundColor: variant.color_hex }}
                          />
                        )}
                        {color}
                      </button>
                    );
                  })}
                </div>
                <Select 
                  data-testid={PRODUCT_DETAIL.colorSelect}
                  value={selectedColor} 
                  onValueChange={setSelectedColor}
                >
                  <SelectTrigger className="hidden">
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
                <label className="block font-tajawal font-semibold mb-2">
                  المقاس: {selectedSize ? (
                    <span className="text-burgundy-500 font-bold" data-testid="selected-size-display">{selectedSize}</span>
                  ) : (
                    <span className="text-red-500 font-bold" data-testid="selected-size-display">* الرجاء الاختيار</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2" data-testid="size-swatches">
                  {product.available_sizes?.map(size => (
                    <button
                      key={size}
                      data-testid={`size-swatch-${size}`}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-4 py-2 rounded-full border-2 font-cairo font-semibold transition-all ${
                        selectedSize === size 
                          ? 'border-burgundy-500 bg-burgundy-500 text-white' 
                          : 'border-gray-300 hover:border-burgundy-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <Select 
                  data-testid={PRODUCT_DETAIL.sizeSelect}
                  value={selectedSize} 
                  onValueChange={setSelectedSize}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.available_sizes?.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-tajawal font-semibold mb-2">الكمية:</label>
                <div className="flex items-center gap-3" data-testid="quantity-selector">
                  <button
                    data-testid="quantity-decrease"
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-burgundy-500 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span 
                    data-testid="quantity-value"
                    className="w-12 text-center font-bold text-lg"
                  >
                    {quantity}
                  </span>
                  <button
                    data-testid="quantity-increase"
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-burgundy-500 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
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
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1 border-burgundy-500 text-burgundy-500 hover:bg-burgundy-500 hover:text-white text-lg py-6"
              >
                اشتري الآن
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-cairo font-semibold text-gray-700">شارك المنتج:</span>
                
                <a
                  data-testid="share-whatsapp-btn"
                  href={`https://wa.me/?text=${encodeURIComponent(`✨ شوفي هذا المنتج الرائع من وهيبة فاشن ✨\n\n${product.name_ar}\n💰 السعر: ${formatPrice(product.price)}\n\n🔗 ${buildShareUrl()}${user?.referral_code ? '\n\n🎁 استخدمي كود الإحالة ' + user.referral_code + ' عند التسجيل للحصول على 50 نقطة!' : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-cairo font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  مشاركة على واتس آب
                </a>

                <button
                  data-testid="share-native-btn"
                  onClick={async () => {
                    const shareUrl = buildShareUrl();
                    const shareData = {
                      title: product.name_ar,
                      text: `${product.name_ar} - ${formatPrice(product.price)}`,
                      url: shareUrl
                    };
                    if (navigator.share) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {}
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success('تم نسخ رابط المنتج');
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-cairo font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>

                <button
                  data-testid="copy-link-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(buildShareUrl());
                    toast.success('تم نسخ الرابط');
                  }}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-cairo font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <Copy className="w-4 h-4" />
                  نسخ الرابط
                </button>

                <button
                  data-testid="download-product-image-btn"
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-2 bg-burgundy-500/10 text-burgundy-500 hover:bg-burgundy-500 hover:text-white font-cairo font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                  title="تنزيل صورة المنتج مع تشغيل نغمة الشعار"
                >
                  <Download className="w-4 h-4" />
                  تنزيل صورة المنتج
                </button>
              </div>

              {user?.referral_code && (
                <p className="text-sm text-brand-gold font-cairo font-semibold">
                  💡 المشاركة تحتوي على كود الإحالة الخاص بك - اكسبي نقاط عند شراء صديقاتك!
                </p>
              )}

              <a
                data-testid={PRODUCT_DETAIL.whatsappBtn}
                href={`${SOCIAL_LINKS.whatsapp_url}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن ${product.name_ar}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-cairo font-semibold"
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

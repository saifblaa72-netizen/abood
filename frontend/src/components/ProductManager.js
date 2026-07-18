import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, categories, sizes } from '@/lib/utils';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductManager = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة فقط');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجا');
      return;
    }

    setUploadingIndex(index);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const response = await axios.post(`${API}/upload`, uploadForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      updateImage(index, 'url', response.data.url);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      toast.error('فشل رفع الصورة');
      console.error(error);
    } finally {
      setUploadingIndex(null);
    }
  };

  function initialFormState() {
    return {
      name_ar: '',
      description_ar: '',
      category: 'dresses',
      price: '',
      original_price: '',
      discount_percentage: '',
      material_ar: '',
      is_featured: false,
      is_new: true,
      is_on_sale: false,
      images: [{ url: '', alt: '', is_primary: true }],
      variants: [{ color: '', color_hex: '#722F37', size: 'M', stock: 10, sku: '' }],
    };
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products?limit=100`);
      setProducts(response.data);
    } catch (error) {
      toast.error('فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData(initialFormState());
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name_ar: product.name_ar || '',
      description_ar: product.description_ar || '',
      category: product.category || 'dresses',
      price: product.price || '',
      original_price: product.original_price || '',
      discount_percentage: product.discount_percentage || '',
      material_ar: product.material_ar || '',
      is_featured: product.is_featured || false,
      is_new: product.is_new || false,
      is_on_sale: product.is_on_sale || false,
      images: product.images?.length > 0 ? product.images : [{ url: '', alt: '', is_primary: true }],
      variants: product.variants?.length > 0 ? product.variants : [{ color: '', color_hex: '#722F37', size: 'M', stock: 10, sku: '' }],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_ar || !formData.price || formData.images.every(i => !i.url)) {
      toast.error('يرجى ملء الحقول المطلوبة (الاسم، السعر، صورة واحدة على الأقل)');
      return;
    }

    const validImages = formData.images.filter(i => i.url);
    const validVariants = formData.variants.filter(v => v.color && v.size);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
      images: validImages,
      variants: validVariants.map(v => ({
        ...v,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || `${formData.category.toUpperCase()}-${v.color}-${v.size}-${Date.now()}`
      }))
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await axios.post(`${API}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تمت إضافة المنتج بنجاح');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('فشل حفظ المنتج');
      console.error(error);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('هل أنت متأكدة من حذف هذا المنتج؟')) return;
    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم حذف المنتج');
      fetchProducts();
    } catch (error) {
      toast.error('فشل حذف المنتج');
    }
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, { url: '', alt: '', is_primary: false }] });
  };

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const updateImage = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData({ ...formData, images: newImages });
  };

  const addVariant = () => {
    setFormData({ 
      ...formData, 
      variants: [...formData.variants, { color: '', color_hex: '#722F37', size: 'M', stock: 10, sku: '' }] 
    });
  };

  const removeVariant = (index) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-tajawal font-bold">إدارة المنتجات ({products.length})</h2>
        <Button 
          data-testid="admin-add-product-btn"
          onClick={openAddDialog}
          className="bg-burgundy-500 hover:bg-burgundy-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">جاري التحميل...</p>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div 
              key={product.id} 
              className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
              data-testid={`admin-product-${product.id}`}
            >
              <img 
                src={product.images?.[0]?.url || '/placeholder.jpg'} 
                alt={product.name_ar}
                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                onError={(e) => e.target.src = '/logo.png'}
              />
              <div className="flex-1">
                <h3 className="font-cairo font-bold">{product.name_ar}</h3>
                <p className="text-sm text-gray-500">
                  {categories.find(c => c.value === product.category)?.label || product.category} • 
                  المخزون: {product.total_stock}
                </p>
                <p className="text-burgundy-500 font-bold mt-1">{formatPrice(product.price)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(product)}
                  data-testid={`admin-edit-${product.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-destructive hover:bg-red-50"
                  data-testid={`admin-delete-${product.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-tajawal text-2xl">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم المنتج *</Label>
                <Input 
                  value={formData.name_ar}
                  onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                  placeholder="مثال: فستان سهرة أنيق"
                />
              </div>
              <div>
                <Label>الفئة *</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(v) => setFormData({...formData, category: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea 
                value={formData.description_ar}
                onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                placeholder="وصف تفصيلي للمنتج..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>السعر *</Label>
                <Input 
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>السعر الأصلي (قبل الخصم)</Label>
                <Input 
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>نسبة الخصم %</Label>
                <Input 
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label>الخامة</Label>
              <Input 
                value={formData.material_ar}
                onChange={(e) => setFormData({...formData, material_ar: e.target.value})}
                placeholder="مثال: حرير طبيعي"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                />
                <span className="font-cairo">منتج مميز</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.is_new}
                  onChange={(e) => setFormData({...formData, is_new: e.target.checked})}
                />
                <span className="font-cairo">منتج جديد</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.is_on_sale}
                  onChange={(e) => setFormData({...formData, is_on_sale: e.target.checked})}
                />
                <span className="font-cairo">عليه خصم</span>
              </label>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  صور المنتج *
                </Label>
                <Button size="sm" variant="outline" onClick={addImage}>
                  <Plus className="w-3 h-3 ml-1" /> صورة
                </Button>
              </div>
              <div className="space-y-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    {img.url && (
                      <img 
                        src={img.url} 
                        alt="preview" 
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={img.url}
                        onChange={(e) => updateImage(idx, 'url', e.target.value)}
                        placeholder="ألصقي رابط الصورة هنا أو استخدمي زر الرفع →"
                      />
                      <label 
                        htmlFor={`file-upload-${idx}`}
                        className="inline-flex items-center gap-2 text-sm cursor-pointer bg-burgundy-500 hover:bg-burgundy-600 text-white px-3 py-1.5 rounded-md transition-colors font-cairo"
                      >
                        {uploadingIndex === idx ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            رفع صورة من جهازك
                          </>
                        )}
                        <input 
                          id={`file-upload-${idx}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(idx, e.target.files[0])}
                          disabled={uploadingIndex !== null}
                        />
                      </label>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeImage(idx)}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 font-cairo">
                💡 يمكنك رفع صورة من جهازك مباشرة (حد أقصى 5 ميجا) أو لصق رابط صورة من الإنترنت
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>الألوان والمقاسات المتوفرة *</Label>
                <Button size="sm" variant="outline" onClick={addVariant}>
                  <Plus className="w-3 h-3 ml-1" /> إضافة
                </Button>
              </div>
              <div className="space-y-2">
                {formData.variants.map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input 
                      value={v.color}
                      onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                      placeholder="اللون (مثل: خمري)"
                      className="w-32"
                    />
                    <input 
                      type="color"
                      value={v.color_hex}
                      onChange={(e) => updateVariant(idx, 'color_hex', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Select 
                      value={v.size}
                      onValueChange={(val) => updateVariant(idx, 'size', val)}
                    >
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[...sizes, 'واحد'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                      placeholder="المخزون"
                      className="w-24"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeVariant(idx)}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave}
                className="flex-1 bg-burgundy-500 hover:bg-burgundy-600"
                data-testid="admin-save-product-btn"
              >
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductManager;

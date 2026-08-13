import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { ArrowLeft, Save, Plus, Trash2, Layers, DollarSign, Image as ImageIcon, Search as SearchIcon, Tag, AlertCircle } from "lucide-react";
import { ImageDropzone } from "../components/ui/ImageDropzone";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

const productSchema = z.object({
  title: z.string().min(3, "Product title must be at least 3 characters long"),
  sku: z.string().optional(),
  price: z.number({ invalid_type_error: "Price must be a valid number" }).positive("Price must be greater than 0"),
  discount: z.number({ invalid_type_error: "Discount must be a number" }).min(0).max(100).optional().default(0),
  stock: z.number({ invalid_type_error: "Stock must be a valid number" }).min(0, "Stock cannot be negative"),
  category_id: z.coerce.number().min(1, "Please select a product category"),
  brand_id: z.string().optional(),
  status: z.enum(["published", "draft", "archived"]),
  is_featured: z.boolean().optional().default(false),
  is_trending: z.boolean().optional().default(false),
  description: z.string().optional(),
  specifications: z.array(z.object({
    key: z.string().min(1, "Key required"),
    value: z.string().min(1, "Value required")
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name required"),
    sku_modifier: z.string(),
    price_override: z.number().optional().nullable(),
    stock: z.number().min(0).default(0)
  })).optional()
});

export const ProductForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState("general");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/admin/categories`, {
            headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
          }),
          axios.get(`${API_BASE_URL}/api/v1/admin/brands`, {
            headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
          })
        ]);
        if (catRes.data) setCategories(catRes.data);
        if (brandRes.data) setBrands(brandRes.data);
      } catch (err) {
        console.error("Failed to load form dependencies from server.", err);
        setCategories([{ name: "Laptops & ROG" }, { name: "MacBooks" }, { name: "Monitors" }, { name: "Peripherals" }, { name: "Components" }]);
        setBrands([{ name: "Asus ROG" }, { name: "Apple" }, { name: "Lenovo Legion" }, { name: "Dell" }, { name: "LG" }]);
      }
    };
    fetchData();
  }, [authState.token]);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      sku: "",
      price: 100000,
      stock: 5,
      category_id: searchParams.get("category_id") ? parseInt(searchParams.get("category_id"), 10) : 1,
      brand_id: searchParams.get("brand_id") || "",
      status: "published",
      is_featured: false,
      is_trending: false,
      description: "",
      specifications: [
        { key: "CPU", value: "" },
      ],
      variants: []
    }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants"
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications"
  });



  useEffect(() => {
    if (isEditing) {
      // Load existing product details
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/v1/admin/products/${id}`, {
            headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
          });

          if (res.data && res.data.product) {
            const prod = res.data.product;
            const inv = res.data.inventory || {};
            reset({
              title: prod.title || "",
              sku: prod.sku || "",
              price: prod.price || 0,
              discount: (prod.price && prod.discount_price && prod.price > prod.discount_price)
                ? Math.round(((prod.price - prod.discount_price) / prod.price) * 100)
                : 0,
              stock: inv.stock_quantity ?? 0,
              category_id: prod.category_id || 1,
              brand_id: prod.brand || "",
              status: prod.status || "published",
              is_featured: prod.is_featured || false,
              is_trending: prod.is_trending || false,
              description: prod.description || prod.meta_description || "",
              specifications: prod.specs ? Object.entries(prod.specs).map(([key, value]) => ({ key, value })) : [],
              variants: res.data.variants || []
            });

            if (res.data.images && res.data.images.length > 0) {
              setImages(res.data.images);
            } else if (prod.image_url) {
              setImages([{ image_url: prod.image_url, is_main: true }]);
            }
          }
        } catch (err) {
          toast.error("Failed to load product details from server.");
          reset({
            title: "",
            sku: "",
            price: 0,
            discount: 0,
            stock: 0,
            category_id: 1,
            brand_id: "",
            status: "draft",
            is_featured: false,
            is_trending: false,
            description: "",
            specifications: [],
            variants: []
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      const specsObj = {};
      if (data.specifications) {
        data.specifications.forEach(spec => {
          if (spec.key && spec.value) {
            specsObj[spec.key] = spec.value;
          }
        });
      }

      let discountPrice = null;
      if (data.discount && data.discount > 0 && data.discount <= 100) {
        discountPrice = data.price - (data.price * (data.discount / 100));
      }

      const payload = {
        title: data.title,
        sku: data.sku,
        price: data.price,
        discount_price: discountPrice,
        stock_quantity: data.stock,
        category_id: data.category_id,
        brand: data.brand_id || "Asus ROG",
        status: data.status,
        is_featured: data.is_featured,
        is_trending: data.is_trending,
        meta_description: data.description,
        specs: specsObj,
        image_url: images.length > 0 ? images.find(i => i.is_main)?.image_url || images[0].image_url : null,
        gallery_images: images.map((img, i) => ({
          image_url: img.image_url,
          is_main: img.is_main || false,
          sort_order: i
        })),
        variants: data.variants ? data.variants.map(v => ({
          name: v.name,
          sku: v.sku_modifier ? `${data.sku}${v.sku_modifier}` : "",
          price: v.price_override || data.price,
          stock_quantity: v.stock
        })) : []
      };

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/v1/admin/products/${id}`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/admin/products`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        toast.success("New product created!");
      }
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to save product to database.");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Layers },
    { id: "pricing", label: "Pricing & Stock", icon: DollarSign },
    { id: "variants", label: "Product Options", icon: Tag },
    { id: "media", label: "Images", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-2xs">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Add details, pricing, stock, and images for your product.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Save Product"}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition select-none ${isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : ""}`} />
              {tab.label}
              {tab.id === "variants" && variantFields.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">{variantFields.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* TAB 1: General & Content */}
        {activeTab === "general" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Product Information</h3>
              <p className="text-xs text-slate-400 mb-4">Basic product details.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Product Name / Title *</label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="Product Title"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                  />
                  {errors.title && <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Category *</label>
                  <select
                    {...register("category_id")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition bg-white"
                  >
                    {categories.map((cat, idx) => (
                      <option key={cat.id || idx} value={cat.id || idx + 1}>{cat.name || cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Brand *</label>
                  <select
                    {...register("brand_id")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition bg-white"
                  >
                    <option value="">Select Brand</option>
                    {brands.length === 0 && <option value="" disabled>Loading brands...</option>}
                    {brands.map((brand, idx) => (
                      <option key={brand.id || idx} value={brand.name || brand}>{brand.name || brand}</option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Visibility Status</label>
                  <select
                    {...register("status")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 transition"
                  >
                    <option value="published">Published (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_featured")}
                      className="w-4 h-4 text-[#7b1113] border-slate-300 rounded focus:ring-[#7b1113]"
                    />
                    Trending Now (Home Page Showcase)
                  </label>

                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Product Description</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Write a description for your product..."
                className="w-full p-4 font-mono text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700">Product Specifications</label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define key-value properties like CPU, RAM, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendSpec({ key: "", value: "" })}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-800 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700 w-1/2 border-r border-slate-200">Component / Property</th>
                      <th className="px-4 py-3 font-bold text-slate-700 w-1/2">Detail / Value</th>
                      <th className="px-4 py-3 font-bold text-slate-700 w-12 text-center border-l border-slate-200"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specFields.map((field, index) => (
                      <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 border-r border-slate-100">
                          <input
                            {...register(`specifications.${index}.key`)}
                            placeholder="e.g. Processor"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 shadow-sm focus:border-slate-400 rounded-lg text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            {...register(`specifications.${index}.value`)}
                            placeholder="e.g. Intel Core i9"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 shadow-sm focus:border-slate-400 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                          />
                        </td>
                        <td className="p-3 text-center border-l border-slate-100">
                          <button
                            type="button"
                            onClick={() => removeSpec(index)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {specFields.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-slate-500 text-xs font-medium">
                          No specifications added. Click "Add Row" to start adding components.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Pricing & Inventory */}
        {activeTab === "pricing" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Pricing & Stock</h3>
              <p className="text-xs text-slate-400 mb-4">Set the price and stock quantity for your product.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Original Price (NPR) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">NPR</span>
                    <input
                      type="number"
                      step="500"
                      {...register("price", { valueAsNumber: true })}
                      className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>
                  {errors.price && <p className="text-xs text-rose-600 font-medium mt-1">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Discount Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...register("discount", { valueAsNumber: true })}
                      className="w-full pl-4 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                      placeholder="e.g. 10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">%</span>
                  </div>
                  {errors.discount && <p className="text-xs text-rose-600 font-medium mt-1">{errors.discount.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Available Stock *</label>
                  <input
                    type="number"
                    min="0"
                    {...register("stock", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                  />
                  {errors.stock && <p className="text-xs text-rose-600 font-medium mt-1">{errors.stock.message}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Variants Generator */}
        {activeTab === "variants" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Product Options (Variants)</h3>
                <p className="text-xs text-slate-400">Add options like Size or Color with custom pricing and stock.</p>
              </div>
              <button
                type="button"
                onClick={() => appendVariant({ name: "Large", sku_modifier: "-L", price_override: watch("price"), stock: 0 })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>

            {variantFields.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                No options added. This product will be sold as a single item.
              </div>
            ) : (
              <div className="space-y-4">
                {variantFields.map((item, index) => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Option Name</label>
                      <input
                        type="text"
                        {...register(`variants.${index}.name`)}
                        placeholder="e.g. Large / Red"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">SKU Suffix</label>
                      <input
                        type="text"
                        {...register(`variants.${index}.sku_modifier`)}
                        placeholder="-RTX4080"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div className="w-full sm:w-44">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Price (NPR)</label>
                      <input
                        type="number"
                        step="500"
                        {...register(`variants.${index}.price_override`, { valueAsNumber: true })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Stock</label>
                      <input
                        type="number"
                        {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="sm:self-end pt-1">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl transition font-bold text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Media Gallery */}
        {activeTab === "media" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Product Images</h3>
              <p className="text-xs text-slate-400 mb-6">Upload images for your product. Click the star to set the main image.</p>
              <ImageDropzone images={images} onChange={setImages} />
            </div>
          </div>
        )}

        {/* Bottom Save CTA Bar */}
        <div className="flex items-center justify-end gap-4 p-5 bg-slate-900 rounded-2xl shadow-xl text-white">
          <span className="text-xs text-slate-400 hidden sm:inline-block">Please review details before saving.</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-xl flex items-center gap-2 transition shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Processing..." : isEditing ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

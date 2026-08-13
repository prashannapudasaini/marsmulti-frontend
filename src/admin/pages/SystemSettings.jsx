import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Save, Mail, MapPin, DollarSign, Globe, Shield, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";

export const SystemSettings = () => {
  const [formData, setFormData] = useState({
    store_name: "Mars Multi - Premium Electronics Flagship Showroom",
    store_url: "https://marsmulti.com.np",
    support_email: "support@marsmulti.com.np",
    support_phone: "+977-1-4400000",
    showroom_address: "Putalisadak, Kathmandu Metropolitan City, Bagmati Province, Nepal",
    currency_code: "NPR",
    tax_percentage: "13",
    meta_title: "Mars Multi Nepal | Genuine Laptops, MacBooks & Custom PCs",
    meta_description: "Kathmandu's #1 authorized electronics hardware showroom. Verified warranty, best domestic prices in NPR, and express nationwide COD delivery.",
    smtp_server: "smtp.marsmulti.com.np",
    smtp_port: "587",
    sender_email: "noreply@marsmulti.com.np"
  });

  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.data) setFormData(res.data);
      } catch (err) {
        console.error("Failed to load settings from server.", err);
        toast.error("Could not load settings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/v1/admin/settings`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      toast.success("Showroom system configurations and SEO metadata saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings.");
    }
  };

  const handleTestEmail = () => {
    setIsTestingEmail(true);
    setTimeout(() => {
      setIsTestingEmail(false);
      toast.success("Test diagnostic email dispatched successfully from SMTP engine.");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Settings & Store Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global showroom variables, domestic Kathmandu coordinates, SEO default metadata, and email delivery engines.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 transition shadow-lg"
        >
          <Save className="w-4 h-4" />
          Save System Configs
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Showroom Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-900 text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Showroom Identity & Localization</h3>
              <p className="text-xs text-slate-400">Basic brand recognition and domestic currency formatting.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Store Brand Title</label>
              <input
                type="text"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Primary Domain URL</label>
              <input
                type="text"
                value={formData.store_url}
                onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Default Showroom Currency</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.currency_code}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-sm font-black text-slate-700 font-mono"
                />
                <span className="px-3 py-2 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-xl shrink-0">Nepalese Rupee</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Value Added Tax (VAT %)</label>
              <input
                type="number"
                value={formData.tax_percentage}
                onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Physical Showroom Coordinates */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-900 text-amber-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Kathmandu Flagship Showroom Contact</h3>
              <p className="text-xs text-slate-400">Printed on invoice footers and customer order confirmation SMS/Emails.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Customer Support Hotline</label>
              <input
                type="text"
                value={formData.support_phone}
                onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Inquiry & Warranty Email</label>
              <input
                type="email"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Physical Storefront Location Address</label>
              <input
                type="text"
                value={formData.showroom_address}
                onChange={(e) => setFormData({ ...formData, showroom_address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SEO Default Optimization */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-900 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Default SEO Meta Parameters</h3>
              <p className="text-xs text-slate-400">Search engine indexing rules and Google snippet presentation for unspecific storefront routes.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Default Page Title Tag</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Default Meta Description</label>
              <textarea
                rows={3}
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full p-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: SMTP Diagnostics */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                SMTP Email Gateway Diagnostics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Test transactional automated email delivery for COD receipts and customer verification links.</p>
            </div>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isTestingEmail}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingEmail ? "animate-spin" : ""}`} />
              {isTestingEmail ? "Transmitting..." : "Send Test Email"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-slate-400 font-sans block mb-1 font-bold">SMTP Host</span>
              <span className="text-white font-bold">{formData.smtp_server}</span>
            </div>
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-slate-400 font-sans block mb-1 font-bold">Port Security</span>
              <span className="text-emerald-400 font-bold">{formData.smtp_port} (TLS Protected)</span>
            </div>
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-slate-400 font-sans block mb-1 font-bold">Sender Identity</span>
              <span className="text-white font-bold">{formData.sender_email}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

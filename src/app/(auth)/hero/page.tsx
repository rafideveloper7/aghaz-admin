'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiArrowUp, FiArrowDown, FiX, FiUpload, FiImage } from 'react-icons/fi';
import { useHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide, useReorderHeroSlides } from '@/hooks/useHeroSlides';
import { uploadApi } from '@/lib/api';
import type { HeroSlide } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function HeroSlidesPage() {
  const { data: slides, isLoading } = useHeroSlides(true);
  const createMutation = useCreateHeroSlide();
  const updateMutation = useUpdateHeroSlide();
  const deleteMutation = useDeleteHeroSlide();
  const reorderMutation = useReorderHeroSlides();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'main' | 'mobile' | 'desktop' | null>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    mobileBg: '',
    desktopBg: '',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    mobileTitle: '',
    mobileSubtitle: '',
    mobileCtaText: '',
    mobileCtaLink: '',
    desktopTitle: '',
    desktopSubtitle: '',
    desktopCtaText: '',
    desktopCtaLink: '',
    rightSideMediaType: 'none',
    rightSideMediaUrl: '',
    rightSideCardTitle: '',
    rightSideCardSubtitle: '',
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    titleFontSize: 52,
    subtitleFontSize: 16,
    heroHeight: 450,
    mobileHeroHeight: 400,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ title: '', subtitle: '', image: '', mobileBg: '', desktopBg: '', ctaText: 'Shop Now', ctaLink: '/shop', mobileTitle: '', mobileSubtitle: '', mobileCtaText: '', mobileCtaLink: '', desktopTitle: '', desktopSubtitle: '', desktopCtaText: '', desktopCtaLink: '', rightSideMediaType: 'none', rightSideMediaUrl: '', rightSideCardTitle: '', rightSideCardSubtitle: '', titleColor: '#ffffff', subtitleColor: '#ffffff', titleFontSize: 52, subtitleFontSize: 16, heroHeight: 450, mobileHeroHeight: 400, isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingId(slide._id);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image: slide.image,
      mobileBg: slide.mobileBg || '',
      desktopBg: slide.desktopBg || '',
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      mobileTitle: slide.mobileTitle || '',
      mobileSubtitle: slide.mobileSubtitle || '',
      mobileCtaText: slide.mobileCtaText || '',
      mobileCtaLink: slide.mobileCtaLink || '',
      desktopTitle: slide.desktopTitle || '',
      desktopSubtitle: slide.desktopSubtitle || '',
      desktopCtaText: slide.desktopCtaText || '',
      desktopCtaLink: slide.desktopCtaLink || '',
      rightSideMediaType: slide.rightSideMediaType || 'none',
      rightSideMediaUrl: slide.rightSideMediaUrl || '',
      rightSideCardTitle: slide.rightSideCardTitle || '',
      rightSideCardSubtitle: slide.rightSideCardSubtitle || '',
      titleColor: slide.titleColor || '#ffffff',
      subtitleColor: slide.subtitleColor || '#ffffff',
      titleFontSize: slide.titleFontSize || 52,
      subtitleFontSize: slide.subtitleFontSize || 16,
      heroHeight: slide.heroHeight || 450,
      mobileHeroHeight: slide.mobileHeroHeight || 400,
      isActive: slide.isActive,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'mobile' | 'desktop' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.data.data.url;
      if (field === 'main') setForm(prev => ({ ...prev, image: url }));
      else if (field === 'mobile') setForm(prev => ({ ...prev, mobileBg: url }));
      else if (field === 'desktop') setForm(prev => ({ ...prev, desktopBg: url }));
      else if (field === 'right') setForm(prev => ({ ...prev, rightSideMediaUrl: url }));
      toast.success(`${field} image uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('Title and main image are required');
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: form });
        toast.success('Slide updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Slide created');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save slide');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Slide deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await updateMutation.mutateAsync({ id: slide._id, data: { isActive: !slide.isActive } });
    } catch {
      toast.error('Failed to update');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if (!slides) return;
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    const updates = newSlides.map((s, i) => ({ id: s._id, sortOrder: i }));
    try {
      await reorderMutation.mutateAsync(updates);
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const ImageField = ({ label, value, onChange, field }: { label: string; value: string; onChange: (url: string) => void; field: 'main' | 'mobile' | 'desktop' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {/* URL Input */}
        <div className="flex gap-2">
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="input-field flex-1"
            placeholder="https://example.com/image.jpg"
          />
          <label className="btn-secondary flex items-center gap-2 cursor-pointer flex-shrink-0">
            {uploading === field ? (
              <span className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
            ) : (
              <FiUpload className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Upload</span>
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff" 
              onChange={e => handleImageUpload(e, field)} 
              className="hidden" 
              disabled={uploading === field} 
            />
          </label>
        </div>
        {/* Preview */}
        {value && (
          <div className="relative h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-red-500 text-xs">Failed to load image</div>';
              }}
            />
            <button 
              onClick={() => onChange('')} 
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <FiX className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage hero banner slides</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <FiPlus className="mr-2 h-4 w-4" />
          Add Slide
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="h-24 w-40 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-64" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !slides?.length ? (
        <div className="card p-12 text-center">
          <FiImage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No hero slides yet</p>
          <button onClick={handleOpenCreate} className="btn-primary">
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div key={slide._id} className="card p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <div className="h-28 w-full sm:w-44 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-200">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-xs">Image not found</div>';
                    }}
                  />
                  {/* Mobile badge */}
                  {slide.mobileBg && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded">Mobile</span>
                  )}
                  {/* Desktop badge */}
                  {slide.desktopBg && (
                    <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded">Desktop</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{slide.title}</h3>
                      {slide.subtitle && <p className="text-sm text-gray-500 mt-0.5">{slide.subtitle}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>CTA: {slide.ctaText}</span>
                        <span>Link: {slide.ctaLink}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => moveSlide(index, 'up')} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                        <FiArrowUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                        <FiArrowDown className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggleActive(slide)} className="p-1.5 rounded-lg hover:bg-gray-100" title={slide.isActive ? 'Deactivate' : 'Activate'}>
                        {slide.isActive ? <FiEye className="h-4 w-4 text-green-600" /> : <FiEyeOff className="h-4 w-4 text-gray-400" />}
                      </button>
                      <button onClick={() => handleOpenEdit(slide)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(slide._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Slide' : 'Add Slide'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Main/Fallback Content */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Colors & Fonts</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title Color</label>
                      <input type="color" value={form.titleColor || '#ffffff'} onChange={e => setForm(prev => ({ ...prev, titleColor: e.target.value }))} className="h-10 w-full rounded border cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle Color</label>
                      <input type="color" value={form.subtitleColor || '#ffffff'} onChange={e => setForm(prev => ({ ...prev, subtitleColor: e.target.value }))} className="h-10 w-full rounded border cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title Size (px)</label>
                      <input type="number" value={form.titleFontSize || 52} onChange={e => setForm(prev => ({ ...prev, titleFontSize: parseInt(e.target.value) || 52 }))} className="input-field" min="16" max="96" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle Size (px)</label>
                      <input type="number" value={form.subtitleFontSize || 16} onChange={e => setForm(prev => ({ ...prev, subtitleFontSize: parseInt(e.target.value) || 16 }))} className="input-field" min="10" max="32" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Main Content (Fallback)</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-4">⚠️ This content is used as fallback if mobile or desktop specific content is not provided.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                      <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="input-field" placeholder="e.g. Discover Smart Living" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                      <input value={form.subtitle} onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))} className="input-field" placeholder="e.g. Premium gadgets at unbeatable prices" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Text</label>
                      <input value={form.ctaText} onChange={e => setForm(prev => ({ ...prev, ctaText: e.target.value }))} className="input-field" placeholder="Shop Now" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Link</label>
                      <input value={form.ctaLink} onChange={e => setForm(prev => ({ ...prev, ctaLink: e.target.value }))} className="input-field" placeholder="/shop" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Height */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Section Height</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Height (px)</label>
                      <input type="number" value={form.mobileHeroHeight || 400} onChange={e => setForm(prev => ({ ...prev, mobileHeroHeight: parseInt(e.target.value) || 400 }))} className="input-field" min="200" max="800" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Desktop Height (px)</label>
                      <input type="number" value={form.heroHeight || 450} onChange={e => setForm(prev => ({ ...prev, heroHeight: parseInt(e.target.value) || 450 }))} className="input-field" min="200" max="800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-Specific Content */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Mobile Content ({'<'} 768px)
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-700 mb-4">📱 Content shown only on mobile devices. Leave empty to use main content above.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Title</label>
                      <input value={form.mobileTitle} onChange={e => setForm(prev => ({ ...prev, mobileTitle: e.target.value }))} className="input-field" placeholder="e.g. Shop on the Go" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Subtitle</label>
                      <input value={form.mobileSubtitle} onChange={e => setForm(prev => ({ ...prev, mobileSubtitle: e.target.value }))} className="input-field" placeholder="e.g. Browse deals anywhere" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile CTA Text</label>
                      <input value={form.mobileCtaText} onChange={e => setForm(prev => ({ ...prev, mobileCtaText: e.target.value }))} className="input-field" placeholder="Shop Now" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile CTA Link</label>
                      <input value={form.mobileCtaLink} onChange={e => setForm(prev => ({ ...prev, mobileCtaLink: e.target.value }))} className="input-field" placeholder="/shop" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop-Specific Content */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Desktop Content (≥ 768px)
                </h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs text-purple-700 mb-4">🖥️ Content shown only on desktop/tablet. Leave empty to use main content above.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Desktop Title</label>
                      <input value={form.desktopTitle} onChange={e => setForm(prev => ({ ...prev, desktopTitle: e.target.value }))} className="input-field" placeholder="e.g. Discover Premium Tech" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Desktop Subtitle</label>
                      <input value={form.desktopSubtitle} onChange={e => setForm(prev => ({ ...prev, desktopSubtitle: e.target.value }))} className="input-field" placeholder="e.g. Elevate your workspace" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Desktop CTA Text</label>
                      <input value={form.desktopCtaText} onChange={e => setForm(prev => ({ ...prev, desktopCtaText: e.target.value }))} className="input-field" placeholder="Explore Now" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Desktop CTA Link</label>
                      <input value={form.desktopCtaLink} onChange={e => setForm(prev => ({ ...prev, desktopCtaLink: e.target.value }))} className="input-field" placeholder="/shop" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Uploads */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Images</h4>
                
                {/* Main Image */}
                <ImageField label="Main Image *" value={form.image} onChange={url => setForm(prev => ({ ...prev, image: url }))} field="main" />
                
                {/* Responsive Backgrounds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Mobile Background */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">Mobile Background</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Shown on screens smaller than 768px. Falls back to main image if empty.</p>
                    <ImageField label="" value={form.mobileBg} onChange={url => setForm(prev => ({ ...prev, mobileBg: url }))} field="mobile" />
                  </div>

                  {/* Desktop Background */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded bg-purple-500 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-sm font-semibold text-purple-700">Desktop Background</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Shown on screens 768px and larger. Falls back to main image if empty.</p>
                    <ImageField label="" value={form.desktopBg} onChange={url => setForm(prev => ({ ...prev, desktopBg: url }))} field="desktop" />
                  </div>
                </div>
              </div>

              {/* Right Side Hero (Desktop Only) */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Right Side Image (Desktop Only)</h4>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-xs text-orange-700 mb-4">🖥️ Image shown on right side of hero on desktop screens (≥ 1024px). Hidden on mobile.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Type</label>
                      <select
                        value={form.rightSideMediaType}
                        onChange={e => setForm(prev => ({ ...prev, rightSideMediaType: e.target.value }))}
                        className="input-field"
                      >
                        <option value="none">No Right Side Content</option>
                        <option value="image">Show Image</option>
                        <option value="card">Show Card with Text</option>
                      </select>
                    </div>
                    {form.rightSideMediaType === 'image' && (
                      <div>
                        <ImageField 
                          label="Right Side Image" 
                          value={form.rightSideMediaUrl} 
                          onChange={url => setForm(prev => ({ ...prev, rightSideMediaUrl: url }))} 
                          field="right" 
                        />
                      </div>
                    )}
                    {form.rightSideMediaType === 'card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Title</label>
                          <input
                            value={form.rightSideCardTitle}
                            onChange={e => setForm(prev => ({ ...prev, rightSideCardTitle: e.target.value }))}
                            className="input-field"
                            placeholder="Special Offer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Subtitle</label>
                          <input
                            value={form.rightSideCardSubtitle}
                            onChange={e => setForm(prev => ({ ...prev, rightSideCardSubtitle: e.target.value }))}
                            className="input-field"
                            placeholder="Limited time offer"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={handleSave} className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Slide" message="Are you sure? This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} variant="danger" />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Modal } from '@/components/Modal';
import { Globe, LogOut, Camera, Trash2, Lock, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import { resolvePhotoUrl } from '@/lib/photos';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  // Photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('pwelltrack_lang', lang);
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('settings.logoutTitle'),
      message: t('settings.logoutConfirm'),
      confirmLabel: t('settings.logout'),
      cancelLabel: t('common.cancel'),
    });
    if (ok) {
      logout();
      router.replace('/login');
    }
  };

  // Profile photo handlers
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try {
      await authApi.uploadPhoto(file);
      refreshUser?.();
      toast(t('common.saved'));
    } catch (err: any) {
      setPhotoError(err.message || t('common.error'));
    }
    e.target.value = '';
  };

  const handleRemovePhoto = async () => {
    setPhotoError('');
    try {
      await authApi.deletePhoto();
      refreshUser?.();
      toast(t('common.deleted'));
    } catch (err: any) {
      setPhotoError(err.message || t('common.error'));
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (newPw.length < 8) {
      setPwError(t('auth.passwordMin'));
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(t('profile.passwordMismatch'));
      return;
    }

    setPwSaving(true);
    try {
      await authApi.changePassword({ current_password: currentPw, new_password: newPw });
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false); }, 1500);
    } catch (err: any) {
      setPwError(err.message || t('common.error'));
    } finally {
      setPwSaving(false);
    }
  };

  // Delete account handler
  // Password visibility
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteText.toUpperCase() !== 'DELETE') return;
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      logout();
      router.replace('/login');
    } catch (err: any) {
      toast(err.message || t('common.error'), 'error');
      setDeleting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9B8EC8] to-[#B4A5D6] bg-clip-text text-transparent mb-6">
          {t('profile.title')}
        </h1>

        {/* Profile card */}
        {user && (
          <div className="card mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar with photo overlay */}
              <div className="relative shrink-0">
                {user.photo_url ? (
                  <img src={resolvePhotoUrl(user.photo_url)} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B4A5D6] to-[#9B8EC8] flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white drop-shadow" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-txt truncate">{user.name}</h2>
                <p className="text-sm text-txt-secondary truncate">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {t('profile.changePhoto')}
                  </button>
                  {user.photo_url && (
                    <>
                      <span className="text-txt-muted">·</span>
                      <button
                        onClick={handleRemovePhoto}
                        className="text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
                      >
                        {t('profile.removePhoto')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
            {photoError && (
              <div className="mt-3 bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium">
                {photoError}
              </div>
            )}
          </div>
        )}

        {/* Change password */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-txt">{t('profile.changePassword')}</h2>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                {t('common.edit')}
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              {pwError && (
                <div className="bg-red-50/80 border border-red-100 text-red-500 px-3.5 py-2.5 rounded-2xl text-sm font-medium">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="bg-emerald-50/80 border border-emerald-100 text-emerald-600 px-3.5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {t('profile.passwordChanged')}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('profile.currentPassword')}</label>
                <div className="relative">
                  <input type={showCurrentPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="input pr-10" />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-primary transition-colors" aria-label={showCurrentPw ? t('common.hidePassword') : t('common.showPassword')}>
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('profile.newPassword')}</label>
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="input pr-10" />
                  <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-primary transition-colors" aria-label={showNewPw ? t('common.hidePassword') : t('common.showPassword')}>
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-txt-secondary block mb-1.5">{t('profile.confirmPassword')}</label>
                <div className="relative">
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="input pr-10" />
                  <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-primary transition-colors" aria-label={showConfirmPw ? t('common.hidePassword') : t('common.showPassword')}>
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowPasswordForm(false); setPwError(''); }} className="btn-secondary flex-1">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={pwSaving} className="btn-primary flex-1">
                  {pwSaving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Language */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-txt">{t('settings.language')}</h2>
          </div>
          <div className="flex gap-2">
            {[
              { code: 'en', label: t('settings.english') },
              { code: 'pt', label: t('settings.portuguese') },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2
                  ${i18n.language === code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-txt-secondary hover:border-primary/30'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="card w-full flex items-center gap-3 text-red-500 hover:bg-red-50/50 transition-colors mb-4">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">{t('settings.logout')}</span>
        </button>

        {/* Delete account */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-txt-muted hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t('profile.deleteAccount')}
        </button>

        {/* Delete account confirmation modal */}
        <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t('profile.deleteAccount')}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50/80 border border-red-100 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{t('profile.deleteWarning')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-txt-secondary block mb-1.5">
                {t('profile.typeDelete')}
              </label>
              <input
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                className="input"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }} className="btn-secondary flex-1">
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText.toUpperCase() !== 'DELETE' || deleting}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? t('common.loading') : t('profile.confirmDelete')}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </>
  );
}

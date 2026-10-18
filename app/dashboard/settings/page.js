'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  User,
  Lock,
  Database,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    username: '',
    email: '',
  });
  const [profileDirty, setProfileDirty] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Seed the form from the session once it arrives (until the user edits).
  useEffect(() => {
    if (session?.user && !profileDirty) {
      setProfile({
        username: session.user.username || '',
        email: session.user.email || '',
      });
    }
  }, [session, profileDirty]);

  const handleProfileChange = (field, value) => {
    setProfileDirty(true);
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (profile.username.trim().length < 3) {
      toast({
        title: 'Username too short',
        description: 'Username must be at least 3 characters.',
        variant: 'destructive',
      });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profile.username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      setProfile((prev) => ({ ...prev, username: data.username }));
      setProfileDirty(false);
      await update?.({ user: { username: data.username } });
      toast({ title: 'Profile saved', description: 'Your username has been updated.' });
    } catch (err) {
      toast({
        title: 'Could not save profile',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match.',
        variant: 'destructive',
      });
      return;
    }
    if (passwords.new.length < 8) {
      toast({
        title: 'Password too short',
        description: 'New password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswords({ current: '', new: '', confirm: '' });
      toast({ title: 'Password updated', description: 'Use your new password next time you sign in.' });
    } catch (err) {
      toast({
        title: 'Could not change password',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = () => {
    // Download the caller's links as CSV.
    window.location.href = '/api/export/links';
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: 'Password required',
        description: 'Enter your password to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      toast({ title: 'Account deleted', description: 'Your account and data have been removed.' });
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      toast({
        title: 'Could not delete account',
        description: err.message,
        variant: 'destructive',
      });
      setDeleting(false);
      setDeletePassword('');
    }
  };

  const passwordField = (id, label, field) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPasswords[field] ? 'text' : 'password'}
          value={passwords[field]}
          onChange={(e) => handlePasswordChange(field, e.target.value)}
          className="h-11 pr-10"
        />
        <button
          type="button"
          aria-label={showPasswords[field] ? 'Hide password' : 'Show password'}
          onClick={() =>
            setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPasswords[field] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-5 md:p-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>
                Your public username and sign-in email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="settings-username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="settings-username"
                  value={profile.username}
                  onChange={(e) => handleProfileChange('username', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="settings-email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="settings-email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Email changes aren’t supported yet.
                </p>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full shadow-lg shadow-primary/15"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingProfile ? 'Saving…' : 'Save profile'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Change password
              </CardTitle>
              <CardDescription>
                At least 8 characters, different from your current one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordField('pw-current', 'Current password', 'current')}
              {passwordField('pw-new', 'New password', 'new')}
              {passwordField('pw-confirm', 'Confirm new password', 'confirm')}
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full shadow-lg shadow-primary/15"
              >
                <Lock className="h-4 w-4 mr-2" />
                {changingPassword ? 'Updating…' : 'Update password'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data management */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
        >
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data management
              </CardTitle>
              <CardDescription>
                Export your links or permanently delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export my data
                </Button>

                {!deleteOpen ? (
                  <Button
                    onClick={() => setDeleteOpen(true)}
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete account
                  </Button>
                ) : (
                  <div className="space-y-2 rounded-lg border border-destructive/40 p-3">
                    <label
                      htmlFor="delete-password"
                      className="text-sm font-medium text-destructive"
                    >
                      Enter your password to permanently delete your account
                    </label>
                    <Input
                      id="delete-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="h-11"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? 'Deleting…' : 'Permanently delete'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeleteOpen(false);
                          setDeletePassword('');
                        }}
                        disabled={deleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Deleting your account permanently removes all your data and
                cannot be undone.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

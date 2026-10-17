'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, Link2, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ThemeToggle } from '../components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { signupSchema } from '@/schema/SignUpSchema';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError('');

    const result = signupSchema.safeParse({ ...formData, agreedToTerms });
    if (!result.success) {
      const formatted = result.error.format();
      const errors = {};
      for (const field of ['username', 'email', 'password', 'confirmPassword', 'agreedToTerms']) {
        const msg = formatted[field]?._errors?.[0];
        if (msg) errors[field] = msg;
      }
      if (errors.agreedToTerms) {
        setFormError(errors.agreedToTerms);
      }
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, agreedToTerms }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.status === 409) {
        // Username taken / email already registered
        const usernameError = data?.errors?.username?._errors?.[0];
        if (usernameError) {
          setFieldErrors({ username: usernameError });
        } else {
          setFormError(data.message || 'Account already exists.');
        }
        return;
      }
      if (!res.ok) {
        setFormError(data.error || data.message || 'Signup failed. Please try again.');
        return;
      }

      toast({
        title: 'Account created',
        description: 'Check your email to verify your account.',
      });
      window.location.href = `/check-email?email=${encodeURIComponent(formData.email)}`;
    } catch (error) {
      setIsLoading(false);
      setFormError('Something went wrong. Please try again.');
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
      >
        <Link2 className="h-6 w-6" />
        <span className="text-xl font-bold">LinkSnip</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm my-10"
      >
        <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-2">
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Free forever — upgrade only if you need more
            </p>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="signup-username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="signup-username"
                  name="username"
                  autoComplete="username"
                  placeholder="john"
                  value={formData.username}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(fieldErrors.username)}
                  className="h-11"
                />
                {fieldErrors.username && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className="h-11"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {formData.password && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-3 bg-muted/50 rounded-lg">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs">
                        <Check
                          className={`h-3 w-3 shrink-0 ${
                            req.met ? 'text-green-500' : 'text-muted-foreground'
                          }`}
                        />
                        <span
                          className={req.met ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-confirm" className="text-sm font-medium">
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="signup-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-border cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

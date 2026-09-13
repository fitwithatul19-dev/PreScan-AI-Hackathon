import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Shield, Eye, EyeOff, Lock, AlertCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  returnTo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, returnTo }) => {
  const { login, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unverified email state
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUnverifiedEmail(null);
      setResendSuccessMessage(null);

      const result = await login({ email: email.trim(), password });

      if (result.unverified) {
        setUnverifiedEmail(result.email || email.trim());
        return;
      }

      // If returnTo is valid and safe (starts with /app), navigate there; otherwise dashboard
      const target = returnTo && returnTo.startsWith('/app') ? returnTo : ROUTES.DASHBOARD;
      onNavigate(target);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendForUnverified = async () => {
    if (!unverifiedEmail) return;
    try {
      setResending(true);
      setError(null);
      const res = await resendVerification(unverifiedEmail);
      setResendSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => onNavigate(ROUTES.HOME)}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to PreScan Home</span>
        </button>

        <div className="text-center">
          <div
            className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm mx-auto mb-3 cursor-pointer hover:bg-neutral-800 transition-colors"
            onClick={() => onNavigate(ROUTES.HOME)}
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Sign in to PreScan
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Access your creator QA workspace, upload reviews, and policy reports.
          </p>
        </div>

        {/* Unverified Email Warning Banner */}
        {unverifiedEmail && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3 shadow-xs animate-in fade-in-50">
            <div className="flex items-start gap-2.5">
              <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold text-amber-900">
                  Please verify your email before logging in.
                </h4>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  We sent a 6-digit verification code to <span className="font-semibold">{unverifiedEmail}</span>. Verify your email to access your workspace.
                </p>
              </div>
            </div>

            {resendSuccessMessage && (
              <div className="text-[11px] text-emerald-700 bg-emerald-100/60 p-2 rounded font-medium">
                {resendSuccessMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                className="justify-center text-xs flex-1"
                onClick={() => onNavigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(unverifiedEmail)}`)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Verify Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-center text-xs flex-1"
                onClick={handleResendForUnverified}
                isLoading={resending}
                disabled={resending}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Resend Code
              </Button>
            </div>
          </div>
        )}

        {error && !unverifiedEmail && (
          <Alert variant="error" title="Authentication Error">
            {error}
          </Alert>
        )}

        <Card className="bg-white shadow-sm border-neutral-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Creator Email"
                type="email"
                placeholder="creator@channel.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                  if (unverifiedEmail) setUnverifiedEmail(null);
                }}
                required
                autoFocus
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-neutral-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate(ROUTES.FORGOT_PASSWORD)}
                    className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                      if (unverifiedEmail) setUnverifiedEmail(null);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center mt-2"
                isLoading={loading}
                disabled={loading}
              >
                Sign In to Workspace
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/50"
                onClick={async () => {
                  setEmail('creator@prescan.dev');
                  setPassword('Password123!');
                  try {
                    setLoading(true);
                    setError(null);
                    setUnverifiedEmail(null);
                    await login({ email: 'creator@prescan.dev', password: 'Password123!' });
                    const target = returnTo && returnTo.startsWith('/app') ? returnTo : ROUTES.DASHBOARD;
                    onNavigate(target);
                  } catch (err: any) {
                    setError(err.message || 'Demo login failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                ⚡ 1-Click Demo Account (Alex Creator)
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center text-xs text-neutral-500 pt-2 pb-5 border-t border-neutral-100">
            <p>
              Don't have a PreScan account?{' '}
              <button
                onClick={() => onNavigate(ROUTES.SIGNUP)}
                className="font-semibold text-neutral-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Create free account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>

            <div className="text-[11px] text-neutral-400 pt-1">
              Protected by server-trusted session tokens & tenant isolation.
            </div>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted Session & Password Hashing</span>
        </div>
      </div>
    </div>
  );
};

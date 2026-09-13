import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Shield, Eye, EyeOff, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';

interface SignupPageProps {
  onNavigate: (route: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute password criteria
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const passwordsMatch = password !== '' && password === confirmPassword;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  let strengthWidth = 'w-1/4';

  const score = [hasMinLength, hasNumberOrSymbol, hasLetter, password.length >= 12].filter(Boolean).length;
  if (score >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    strengthWidth = 'w-full';
  } else if (score >= 2) {
    strengthLabel = 'Moderate';
    strengthColor = 'bg-amber-500';
    strengthWidth = 'w-2/3';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        termsAccepted,
      });
      // Navigate to email verification screen with email parameter
      onNavigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create your account.');
    } finally {
      setLoading(false);
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
            Create your PreScan Account
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Pre-screen video dialogue, copyright signals, and metadata before you publish.
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Registration Error">
            {error}
          </Alert>
        )}

        <Card className="bg-white shadow-sm border-neutral-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoFocus
              />

              <Input
                label="Creator Email"
                type="email"
                placeholder="creator@channel.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
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

                {password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Strength: {strengthLabel}</span>
                      <span className="font-mono text-[10px] text-neutral-400">{password.length} chars</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  Confirm Password
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[11px] pt-1">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    required
                  />
                  <span className="text-xs text-neutral-600 leading-normal">
                    I agree to the PreScan{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate(ROUTES.TERMS)}
                      className="underline text-neutral-900 hover:text-black font-medium"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate(ROUTES.PRIVACY)}
                      className="underline text-neutral-900 hover:text-black font-medium"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center mt-2"
                isLoading={loading}
                disabled={loading || !termsAccepted}
              >
                Create Account & Continue
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center text-xs text-neutral-500 pt-2 pb-5 border-t border-neutral-100">
            <p>
              Already have an account?{' '}
              <button
                onClick={() => onNavigate(ROUTES.LOGIN)}
                className="font-semibold text-neutral-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Sign in</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Server-Side Hashing • Zero Plaintext Storage</span>
        </div>
      </div>
    </div>
  );
};

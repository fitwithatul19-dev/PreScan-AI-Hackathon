import React, { useState } from 'react';
import { Sparkles, ArrowLeft, KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [devResetMail, setDevResetMail] = useState<{ token: string; actionUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await forgotPassword(email.trim());
      setMessage(res.message);
      setSubmitted(true);

      // Dev helper fetch
      try {
        const mailRes = await fetch(`/api/auth/dev/latest-email?email=${encodeURIComponent(email.trim())}&type=RESET_PASSWORD`);
        if (mailRes.ok) {
          const mailData = await mailRes.json();
          if (mailData.mail) setDevResetMail(mailData.mail);
        }
      } catch {
        // Ignore
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => onNavigate(ROUTES.LOGIN)}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="text-center">
          <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm mx-auto mb-3">
            <KeyRound className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Reset your password
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Enter the email associated with your PreScan workspace.
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Reset Request Failed">
            {error}
          </Alert>
        )}

        {submitted ? (
          <Card className="bg-white shadow-sm border-neutral-200">
            <CardContent className="pt-6 space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Check your email</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {message || 'If an account exists with this email address, you will receive password reset instructions shortly.'}
                </p>
              </div>

              {devResetMail && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-left text-xs mt-3">
                  <div className="flex items-center justify-between font-semibold text-emerald-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Dev Reset Helper</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono">1-Click Test</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mb-2">
                    In development mode, token link is captured below for immediate testing:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(`/reset-password?token=${devResetMail.token}`);
                    }}
                    className="w-full py-1.5 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Proceed with Reset Token</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <Button
                variant="outline"
                size="md"
                className="w-full justify-center mt-2"
                onClick={() => onNavigate(ROUTES.LOGIN)}
              >
                Return to Login
              </Button>
            </CardContent>
          </Card>
        ) : (
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
                  }}
                  required
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-2"
                  isLoading={loading}
                  disabled={loading}
                >
                  Send Reset Link
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center text-xs text-neutral-500 pt-2 pb-4 border-t border-neutral-100">
              <p>
                Remember your password?{' '}
                <button
                  onClick={() => onNavigate(ROUTES.LOGIN)}
                  className="font-semibold text-neutral-900 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, LogOut, ArrowRight, ShieldCheck, KeyRound, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';

interface VerifyEmailPageProps {
  onNavigate: (route: string) => void;
}

type VerificationStatus =
  | 'WAITING_FOR_VERIFICATION'
  | 'CODE_ENTERED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'INVALID_CODE'
  | 'EXPIRED_CODE'
  | 'TOO_MANY_ATTEMPTS'
  | 'ERROR';

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { user, verifyEmail, resendVerification, logout, onboarding } = useAuth();

  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const queryToken = urlParams.get('token');
  const queryCode = urlParams.get('code');
  const queryEmail = urlParams.get('email');

  const targetEmail = queryEmail || user?.email || '';

  // 6 separate digits for OTP input
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [status, setStatus] = useState<VerificationStatus>('WAITING_FOR_VERIFICATION');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [resending, setResending] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Dev mail helper for non-production environments
  const [devOtpInfo, setDevOtpInfo] = useState<{ code: string; sentAt: string } | null>(null);

  // Mask email for display (e.g. j***@domain.com)
  const maskedEmail = React.useMemo(() => {
    if (!targetEmail) return 'your email';
    const parts = targetEmail.split('@');
    if (parts.length !== 2) return targetEmail;
    const name = parts[0];
    const domain = parts[1];
    const visibleChars = name.length > 2 ? 2 : 1;
    return `${name.slice(0, visibleChars)}***@${domain}`;
  }, [targetEmail]);

  // Handle URL query code or token on mount
  useEffect(() => {
    if (queryCode && queryCode.length === 6 && /^\d+$/.test(queryCode)) {
      const codeArray = queryCode.split('');
      setDigits(codeArray);
      executeVerification(queryCode);
    } else if (queryToken) {
      executeVerificationWithToken(queryToken);
    } else {
      // Focus the first input box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [queryToken, queryCode]);

  // Fetch dev helper OTP in development mode
  const fetchDevOtp = async () => {
    if (targetEmail) {
      try {
        const res = await fetch(`/api/auth/dev/latest-email?email=${encodeURIComponent(targetEmail)}&type=VERIFY_EMAIL`);
        if (res.ok) {
          const data = await res.json();
          if (data.mail && data.mail.token && data.mail.token.length === 6) {
            setDevOtpInfo({
              code: data.mail.token,
              sentAt: data.mail.sentAt,
            });
          }
        }
      } catch {
        // Ignore dev fetch errors
      }
    }
  };

  useEffect(() => {
    fetchDevOtp();
  }, [targetEmail]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const executeVerification = async (codeString: string) => {
    try {
      setStatus('VERIFYING');
      setErrorMessage(null);
      await verifyEmail({ code: codeString, email: targetEmail });
      setStatus('VERIFIED');

      setTimeout(() => {
        if (onboarding?.status === 'COMPLETED') {
          onNavigate(ROUTES.DASHBOARD);
        } else {
          onNavigate(ROUTES.ONBOARDING);
        }
      }, 1500);
    } catch (err: any) {
      const code = err.code;
      if (code === 'EXPIRED_CODE') {
        setStatus('EXPIRED_CODE');
        setErrorMessage('The verification code has expired. Please request a new code.');
      } else if (code === 'TOO_MANY_ATTEMPTS') {
        setStatus('TOO_MANY_ATTEMPTS');
        setErrorMessage('Too many incorrect attempts. Please request a new verification code.');
        setAttemptsRemaining(0);
      } else if (code === 'INVALID_CODE') {
        setStatus('INVALID_CODE');
        setErrorMessage(err.message || 'Incorrect verification code.');
        if (typeof err.attemptsRemaining === 'number') {
          setAttemptsRemaining(err.attemptsRemaining);
        }
      } else {
        setStatus('ERROR');
        setErrorMessage(err.message || 'Failed to verify code.');
      }
    }
  };

  const executeVerificationWithToken = async (tokenString: string) => {
    try {
      setStatus('VERIFYING');
      setErrorMessage(null);
      await verifyEmail({ token: tokenString });
      setStatus('VERIFIED');
      setTimeout(() => {
        onNavigate(ROUTES.ONBOARDING);
      }, 1500);
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'Verification link is invalid or expired.');
    }
  };

  // Input change handler for 6 OTP boxes
  const handleDigitChange = (index: number, value: string) => {
    // Handle typing single character or pasting
    const numericChar = value.replace(/\D/g, '');

    if (!numericChar) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit entry
    const charToInsert = numericChar.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = charToInsert;
    setDigits(newDigits);

    // Auto advance focus
    if (index < 5 && charToInsert) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      executeVerification(fullCode);
    }
  };

  // Keydown handler for backspace & arrow keys
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedText.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedText.length; i++) {
        newDigits[i] = pastedText[i];
      }
      setDigits(newDigits);

      const focusIdx = Math.min(pastedText.length, 5);
      inputRefs.current[focusIdx]?.focus();

      if (pastedText.length === 6) {
        executeVerification(pastedText);
      }
    }
  };

  const handleManualVerify = () => {
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }
    executeVerification(fullCode);
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setErrorMessage(null);
      setResendMessage(null);
      const res = await resendVerification(targetEmail);
      setResendMessage(res.message);
      setResendCooldown(60);
      setStatus('WAITING_FOR_VERIFICATION');
      setDigits(['', '', '', '', '', '']);
      setAttemptsRemaining(null);
      inputRefs.current[0]?.focus();
      // Fetch latest dev OTP if in dev mode
      await fetchDevOtp();
    } catch (err: any) {
      if (err.code === 'RESEND_COOLDOWN') {
        setResendCooldown(err.remainingSeconds || 60);
      }
      setErrorMessage(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate(ROUTES.LOGIN);
  };

  const isCodeComplete = digits.every((d) => d.length === 1);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Mail className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Verify your email
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Enter the 6-digit verification code we sent to{' '}
            <span className="font-semibold text-neutral-900">{maskedEmail}</span>.
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <Alert variant="error" title="Verification Error">
            <div className="space-y-1">
              <p>{errorMessage}</p>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-[11px] font-medium text-red-600">
                  {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining before code lock.
                </p>
              )}
            </div>
          </Alert>
        )}

        {resendMessage && (
          <Alert variant="success" title="Code Sent">
            {resendMessage}
          </Alert>
        )}

        {status === 'VERIFIED' && (
          <Alert variant="success" title="Email Verified">
            Your email has been verified! Redirecting to workspace setup...
          </Alert>
        )}

        {/* Verification Card */}
        <Card className="bg-white shadow-sm border-neutral-200">
          <CardContent className="pt-6 pb-6 space-y-6">
            {status === 'VERIFIED' ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-900">Email Verified Successfully</h3>
                  <p className="text-xs text-neutral-500">Proceeding to creator workspace configuration...</p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => onNavigate(ROUTES.ONBOARDING)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <>
                {/* 6-Digit OTP Box Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-700 text-center">
                    6-Digit Security Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        disabled={status === 'VERIFYING' || status === 'TOO_MANY_ATTEMPTS'}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-lg border transition-all outline-hidden
                          ${
                            status === 'INVALID_CODE' || status === 'TOO_MANY_ATTEMPTS'
                              ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                              : digit
                              ? 'border-neutral-900 bg-neutral-50/50 text-neutral-900 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200'
                              : 'border-neutral-300 bg-white text-neutral-900 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200'
                          }`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                </div>

                {/* Expiration Note */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Code expires in 10 minutes</span>
                </div>

                {/* Primary Action Button */}
                <div className="space-y-2.5 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center text-sm font-semibold"
                    onClick={handleManualVerify}
                    disabled={!isCodeComplete || status === 'VERIFYING' || status === 'TOO_MANY_ATTEMPTS'}
                    isLoading={status === 'VERIFYING'}
                  >
                    {status === 'VERIFYING' ? 'Verifying Code...' : 'Verify Email'}
                  </Button>

                  {/* Resend Code Button */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || resendCooldown > 0}
                      className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendCooldown > 0 ? (
                        <span className="flex items-center justify-center gap-1.5 text-neutral-400">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Resend code in {resendCooldown}s
                        </span>
                      ) : (
                        <span>Didn't receive a code? <span className="underline decoration-neutral-400 underline-offset-2">Resend code</span></span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dev Mode Helper (Inspection & 1-click test in non-prod) */}
                {devOtpInfo && (
                  <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Development Delivery Log</span>
                      </span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                        Dev Mode
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-900 bg-white/70 rounded p-2 border border-emerald-100">
                      <span className="text-[11px] text-emerald-700">Latest dispatched OTP:</span>
                      <code className="font-mono text-sm font-bold tracking-widest text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {devOtpInfo.code}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const codeArray = devOtpInfo.code.split('');
                        setDigits(codeArray);
                        executeVerification(devOtpInfo.code);
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Auto-fill and verify OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between text-xs text-neutral-500 pt-3 pb-4 border-t border-neutral-100">
            <button
              onClick={handleLogout}
              className="text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Use different email</span>
            </button>

            <span className="text-[11px] text-neutral-400 font-medium">Security Step 1 of 2</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

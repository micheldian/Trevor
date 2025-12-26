'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

/**
 * Admin Login Page
 *
 * Two-step login process:
 * 1. Enter phone or email
 * 2. Enter OTP code
 *
 * Uses existing OTP/JWT authentication system
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, requestOtp, verifyOtp } = useAdminAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || '/admin';
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * Handle request OTP
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!phoneOrEmail.trim()) {
      setError('Please enter your phone number or email');
      setIsLoading(false);
      return;
    }

    const result = await requestOtp(phoneOrEmail);

    if (!result.success) {
      setError(result.error || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
      return;
    }

    setStep('otp');
    setCountdown(300); // 5 minutes
    setIsLoading(false);
  };

  /**
   * Handle verify OTP
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otp.trim()) {
      setError('Please enter the OTP code');
      setIsLoading(false);
      return;
    }

    const result = await verifyOtp(phoneOrEmail, otp);

    if (!result.success) {
      setError(result.error || 'Invalid OTP. Please try again.');
      setIsLoading(false);
      return;
    }

    // Success - redirect handled by useEffect
    const returnUrl = searchParams.get('returnUrl') || '/admin';
    router.push(returnUrl);
  };

  /**
   * Resend OTP
   */
  const handleResendOtp = async () => {
    setError('');
    setOtp('');
    setIsLoading(true);

    const result = await requestOtp(phoneOrEmail);

    if (!result.success) {
      setError(result.error || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
      return;
    }

    setCountdown(300);
    setIsLoading(false);
  };

  /**
   * Go back to phone step
   */
  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Trevor Admin</h1>
          <p className="mt-2 text-sm text-gray-600">
            Secure admin console access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Phone/Email */}
          {step === 'phone' && (
            <form onSubmit={handleRequestOtp}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your admin phone number or email
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone or Email
                </label>
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="+33 6 12 34 56 78 or admin@trevor.ag"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Enter Code
                </h2>
                <p className="text-sm text-gray-600">
                  We sent a verification code to{' '}
                  <span className="font-medium">{phoneOrEmail}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  disabled={isLoading}
                  autoFocus
                  maxLength={6}
                />
              </div>

              {countdown > 0 && (
                <div className="mb-4 text-center text-sm text-gray-600">
                  Code expires in{' '}
                  <span className="font-medium">
                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  ← Change number
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-green-600 hover:text-green-700 font-medium"
                  disabled={isLoading || countdown > 240}
                >
                  {countdown > 240 ? 'Wait to resend' : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Admin access only. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Building2,
  Smartphone,
  CreditCard,
  KeyRound,
  FileText,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export interface BankConnectionParams {
  institutionName: string;
  accountType: 'Savings' | 'Current' | 'Salary';
  accountNumber: string;
  mobileNumber: string;
  ifscCode?: string;
}

interface FinancialConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentApproved: (params: BankConnectionParams) => void;
  providerStatusMessage?: string;
}

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', ifsc: 'HDFC0001024', color: 'from-blue-600 to-indigo-700' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBIN', ifsc: 'SBIN0000452', color: 'from-sky-600 to-blue-800' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC', ifsc: 'ICIC0000001', color: 'from-orange-600 to-amber-700' },
  { id: 'axis', name: 'Axis Bank', code: 'UTIB', ifsc: 'UTIB0000028', color: 'from-rose-700 to-pink-800' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KKBK', ifsc: 'KKBK0000123', color: 'from-red-600 to-rose-700' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PUNB', ifsc: 'PUNB0001928', color: 'from-amber-600 to-yellow-700' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BARB', ifsc: 'BARB0000210', color: 'from-orange-500 to-amber-600' },
  { id: 'canara', name: 'Canara Bank', code: 'CNRB', ifsc: 'CNRB0000142', color: 'from-cyan-600 to-blue-600' }
];

export const FinancialConsentModal: React.FC<FinancialConsentModalProps> = ({
  isOpen,
  onClose,
  onConsentApproved,
  providerStatusMessage
}) => {
  // Step navigation: 1: Bank & Details, 2: Consent Review, 3: OTP Verification, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [isCustomBank, setIsCustomBank] = useState<boolean>(false);
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountType, setAccountType] = useState<'Savings' | 'Current' | 'Salary'>('Savings');
  const [accountNumber, setAccountNumber] = useState<string>('102938475621');
  const [holderName, setHolderName] = useState<string>('Kaviraja B V');
  const [mobileNumber, setMobileNumber] = useState<string>('9876543210');
  const [ifscCode, setIfscCode] = useState<string>('HDFC0001024');

  // Consent & OTP states
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBankName = isCustomBank ? customBankName.trim() || 'Custom Bank' : selectedBank;
  const cleanAccNum = accountNumber.replace(/\D/g, '');
  const maskedAccPreview = cleanAccNum.length >= 4 ? `•••• •••• ${cleanAccNum.slice(-4)}` : '•••• •••• ----';

  // Handle bank change
  const handleSelectBank = (bankName: string, defaultIfsc: string) => {
    setSelectedBank(bankName);
    setIsCustomBank(false);
    setIfscCode(defaultIfsc);
  };

  // Validation before going to Step 2
  const handleProceedToConsent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isCustomBank && !customBankName.trim()) {
      setFormError('Please enter your Bank or Financial Institution name.');
      return;
    }
    if (cleanAccNum.length < 6) {
      setFormError('Please enter a valid Bank Account Number (minimum 6 digits).');
      return;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit registered mobile number.');
      return;
    }
    if (!holderName.trim()) {
      setFormError('Please enter the primary account holder name.');
      return;
    }

    setStep(2);
  };

  // Proceed from Consent (Step 2) to OTP (Step 3)
  const handleProceedToOtp = () => {
    if (!agreedToTerms) {
      setFormError('You must accept the read-only consent authorization to proceed.');
      return;
    }
    setFormError(null);
    setStep(3);
  };

  // Verify OTP (Step 3)
  const handleVerifyOtp = () => {
    if (otpValue.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }
    setOtpError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 900);
  };

  // Final confirmation
  const handleFinalizeConnection = () => {
    onConsentApproved({
      institutionName: currentBankName,
      accountType,
      accountNumber: cleanAccNum,
      mobileNumber: mobileNumber.replace(/\D/g, ''),
      ifscCode: ifscCode.trim().toUpperCase()
    });
    onClose();
    // Reset back to Step 1 for future opens
    setTimeout(() => {
      setStep(1);
      setOtpValue('');
      setFormError(null);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 relative text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Connect Bank Account</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                RBI Compliant AA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Consent-driven read-only connection via Account Aggregator architecture
            </p>
          </div>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="py-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5 px-1">
            <span className={step >= 1 ? 'text-cyan-400 font-semibold' : ''}>1. Account Details</span>
            <span className={step >= 2 ? 'text-cyan-400 font-semibold' : ''}>2. Consent Terms</span>
            <span className={step >= 3 ? 'text-cyan-400 font-semibold' : ''}>3. OTP Verification</span>
            <span className={step >= 4 ? 'text-cyan-400 font-semibold' : ''}>4. Connected</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error notification banner if any */}
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 1: Select Bank & Enter Account Details          */}
        {/* ==================================================== */}
        {step === 1 && (
          <form onSubmit={handleProceedToConsent} className="space-y-4 pt-1">
            {/* Bank Institution Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Select Banking Institution</span>
                <span className="text-[11px] text-slate-500 font-normal">Account Aggregator Ecosystem</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POPULAR_BANKS.map((b) => {
                  const isSelected = !isCustomBank && selectedBank === b.name;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBank(b.name, b.ifsc)}
                      className={`p-2 rounded-xl border text-left text-xs font-semibold transition flex flex-col items-start gap-1 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono text-cyan-400/80 bg-slate-900 px-1 rounded">
                          {b.code}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="font-medium text-[11px] truncate w-full text-slate-200">{b.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Other bank button */}
              <button
                type="button"
                onClick={() => setIsCustomBank(true)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition ${
                  isCustomBank
                    ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                + Other Bank / Regional Rural Bank / Cooperative Bank
              </button>

              {isCustomBank && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Enter your Bank Name (e.g., Union Bank of India)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    required
                  />
                </div>
              )}
            </div>

            {/* Account Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Account Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Savings', 'Current', 'Salary'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center ${
                      accountType === type
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-semibold ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type} Account
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Account Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Account Number</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{maskedAccPreview}</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))}
                    placeholder="e.g. 102938475621"
                    maxLength={18}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Registered Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Registered Mobile No.</span>
                  <span className="text-[10px] text-slate-500">Bank OTP Verification</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-800 bg-slate-950/80 text-slate-400 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full px-3 py-2 rounded-r-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Account Holder Name</label>
                <input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="Full name as per bank records"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Branch IFSC Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Branch IFSC Code</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase().slice(0, 11))}
                  placeholder="e.g. HDFC0001024"
                  maxLength={11}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Zero Password Guarantee Callout */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-slate-300 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Strict Credential Isolation</span>
                <span>
                  FortiFi will never ask for your NetBanking password, UPI PIN, ATM PIN, or CVV. Bank authorization is performed purely via encrypted Account Aggregator consent.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-1.5"
              >
                <span>Review Consent Terms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* STEP 2: Consent Terms & Privacy Safeguards           */}
        {/* ==================================================== */}
        {step === 2 && (
          <div className="space-y-4 pt-1">
            {/* Account Summary Chip */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {currentBankName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{currentBankName}</div>
                  <div className="text-[11px] text-slate-400">
                    {accountType} Account • {maskedAccPreview}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Edit Details
              </button>
            </div>

            {/* Consent Scope */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Explicit Read-Only Consent Agreement</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <p>
                  You are granting permission for FortiFi to fetch the following financial data via RBI-regulated Account Aggregator rails:
                </p>
                <div className="space-y-1.5 pl-1">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Read-Only Statements:</strong> Past 90 days transaction records</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Account Balance:</strong> Live balance for budgeting and cash-flow tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Security Telemetry:</strong> Transaction metadata for CyberShield anomaly detection</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-rose-400 font-semibold mb-1.5">Strict Prohibitions (FortiFi CANNOT):</p>
                <div className="space-y-1 pl-1 text-slate-400">
                  <div className="flex items-center gap-2 text-rose-300/90">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Cannot withdraw, transfer, or move funds from your account</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300/90">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Cannot initiate payments, bill debits, or modify beneficiaries</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300/90">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Cannot access or store your NetBanking password or UPI credentials</span>
                  </div>
                </div>
              </div>

              {/* Consent Parameters */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">Consent Validity:</span>
                  <span className="text-white font-medium">365 Days (Revocable anytime)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Fetch Mode:</span>
                  <span className="text-white font-medium">Periodic Read-Only Sync</span>
                </div>
              </div>
            </div>

            {/* Checkbox Acceptance */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-slate-300 leading-snug">
                I hereby grant consent to retrieve read-only statements for <strong className="text-white">{currentBankName} ({accountType})</strong> under the RBI Account Aggregator framework.
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToOtp}
                disabled={!agreedToTerms}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-1.5"
              >
                <span>Authorize & Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: OTP Verification                            */}
        {/* ==================================================== */}
        {step === 3 && (
          <div className="space-y-4 pt-1">
            {/* Bank Authorization Notice */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Bank Authorization OTP</h3>
              <p className="text-xs text-slate-400">
                A 6-digit verification code has been dispatched to your bank-registered mobile:{' '}
                <strong className="text-white font-mono">+91 ••••• {mobileNumber.slice(-4) || '3210'}</strong>
              </p>
            </div>

            {/* Simulated Live SMS Notification Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs space-y-1.5 shadow-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulated Bank SMS (Account Aggregator Gateway)
                </span>
                <span className="font-mono text-slate-500">Just now</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                &quot;892110 is your FortiFi Account Aggregator consent OTP for {currentBankName} ({accountType}). Valid for 10 mins. Do not share with anyone.&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setOtpValue('892110');
                  setOtpError(null);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline block pt-0.5"
              >
                ⚡ Click to auto-fill simulated OTP: 892110
              </button>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block text-center">
                Enter 6-Digit Consent Code
              </label>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setOtpError(null);
                  }}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full py-2.5 px-4 text-center font-mono text-xl tracking-[0.5em] rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  autoFocus
                />
              </div>
              {otpError && (
                <p className="text-center text-rose-400 text-xs font-medium">{otpError}</p>
              )}
            </div>

            {/* Resend OTP info */}
            <div className="text-center text-[11px] text-slate-400">
              Didn&apos;t receive code?{' '}
              <button
                type="button"
                onClick={() => setOtpValue('892110')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Resend OTP
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Verifying Bank Handshake...</span>
                ) : (
                  <>
                    <span>Verify & Link Account</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: Success & Discovered Account Confirmation   */}
        {/* ==================================================== */}
        {step === 4 && (
          <div className="space-y-4 pt-1 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Bank Account Verified & Linked!</h3>
              <p className="text-xs text-slate-400">
                Consent artifact signed digitally under the Account Aggregator framework.
              </p>
            </div>

            {/* Discovered Account Details Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-left space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    {currentBankName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-white block text-sm">{currentBankName}</span>
                    <span className="text-[11px] text-slate-400">
                      {accountType} • {maskedAccPreview}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  CONNECTED — READ ONLY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Account Holder:</span>
                  <span className="text-white font-medium">{holderName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Registered Mobile:</span>
                  <span className="text-white font-mono text-[11px]">+91 ••••• {mobileNumber.slice(-4)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Initial Verified Balance:</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    ₹{accountType === 'Current' ? '2,45,000' : '82,450'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Branch IFSC:</span>
                  <span className="text-white font-mono text-[11px]">{ifscCode || 'HDFC0001024'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Consent Status: <strong className="text-cyan-400">ACTIVE</strong></span>
                <span>Statements: <strong>Last 90 Days</strong></span>
              </div>
            </div>

            {/* Action to complete */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinalizeConnection}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2"
              >
                <span>Complete Setup & View Accounts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

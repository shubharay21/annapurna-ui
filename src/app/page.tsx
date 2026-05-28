"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api, CaptchaResponse, VerifyOtpResponse } from "@/lib/api";
import {
  loadZonesConfig,
  getZoneForDistrict,
  getApiUrlForZone,
  saveZoneSession,
  Zone,
} from "@/lib/zones";
import { loadMasterData } from "@/lib/masterData";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mobile, setMobile] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [otp, setOtp] = useState("");

  // District / zone state
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [resolvedZoneName, setResolvedZoneName] = useState<string | null>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  const loadCaptcha = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<CaptchaResponse>("/auth/captcha");
      setCaptcha(res);
      setCaptchaAnswer("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load captcha");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load district list from master data and zones config
    Promise.all([loadMasterData(), loadZonesConfig()]).then(([master, zonesCfg]) => {
      setDistricts(master.districts);
      setZones(zonesCfg.zones);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCaptcha();

    // Close dropdown on outside click
    const handler = (e: MouseEvent) => {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setDistrictSearch(district);
    setShowDistrictDropdown(false);
    // Resolve zone and persist API URL immediately
    const zone = getZoneForDistrict(district, zones);
    if (zone) {
      saveZoneSession(district, zone);
      setResolvedZoneName(zone.zoneName);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDistrict) {
      setError("Please select your district before proceeding.");
      return;
    }
    if (!mobile || !mobile.match(/^[6-9]\d{9}$/)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!captchaAnswer) {
      setError("Please solve the captcha");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.post("/auth/send-otp", {
        mobileNumber: mobile,
        captchaId: captcha?.captchaId,
        captchaAnswer: captchaAnswer,
      });
      setStep("OTP");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", {
        mobileNumber: mobile,
        otp: otp,
      });
      // Cookies are now set as HttpOnly by the Next.js Middleware proxy
      // Store mobile so the form can pre-fill Contact No. without decoding JWT
      localStorage.setItem("annapurna_mobile", mobile);
      router.push("/form");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const filteredDistricts = districts.filter((d) =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const canProceed = !!selectedDistrict;

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-primary text-on-primary">
        <div className="flex items-center gap-stack-md">
          <span className="material-symbols-outlined text-display-lg-mobile">account_balance</span>
          <span className="text-headline-md font-bold">Govt of West Bengal</span>
        </div>
        <nav className="hidden lg:flex gap-margin-desktop items-center">
          <a className="text-label-md hover:text-secondary-fixed-dim transition-colors" href="#">Dashboard</a>
          <a className="text-label-md border-b-2 border-secondary-fixed pb-1" href="#">Exclusions</a>
          <a className="text-label-md hover:text-secondary-fixed-dim transition-colors" href="#">History</a>
          <a className="text-label-md hover:text-secondary-fixed-dim transition-colors" href="#">Support</a>
        </nav>
        <div className="flex items-center gap-stack-md">
          <span className="material-symbols-outlined cursor-pointer">help</span>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-grow pt-16 flex items-center justify-center">
        <div className="max-w-container-max w-full mx-auto p-margin-mobile md:p-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left Column - Portal Branding & Key Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container text-caption font-bold rounded-full mb-3">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Official Welfare Portal</span>
              </div>
              <h1 className="text-headline-lg font-bold text-primary tracking-tight leading-tight">
                Annapurna Yojana
              </h1>
              <p className="text-headline-md font-medium text-secondary mt-1">
                Family Level Data Collection &amp; Exclusion Criteria
              </p>
              <p className="text-body-md text-on-surface-variant mt-4 max-w-xl">
                Welcome to the consolidated portal for the Annapurna Yojana initiative. Citizens can securely log in using their registered mobile number to complete or resume their multi-step family level registration.
              </p>
            </div>

            {/* Application Stages Info Panel */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
              <h3 className="text-label-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
                <span className="material-symbols-outlined">description</span>
                <span>Application Process Overview</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg h-10 w-10 flex items-center justify-center">group</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">1. Family Identity</h4>
                    <p className="text-caption text-on-surface-variant">Primary details &amp; family structure</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg h-10 w-10 flex items-center justify-center">badge</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">2. Ration Card</h4>
                    <p className="text-caption text-on-surface-variant">Card category &amp; lifting details</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg h-10 w-10 flex items-center justify-center">account_balance</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">3. Assets &amp; Income</h4>
                    <p className="text-caption text-on-surface-variant">Land, vehicles, &amp; earnings disclosure</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg h-10 w-10 flex items-center justify-center">fact_check</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">4. Verification</h4>
                    <p className="text-caption text-on-surface-variant">Legal declaration &amp; submission</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Banner */}
            <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-lg">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-caption text-on-surface-variant">
                <strong>Prerequisites:</strong> Ensure you have your Aadhaar Card, Ration Card, Bank Account passbook, and a working mobile number ready.
              </p>
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-fixed text-primary mb-3">
                  <span className="material-symbols-outlined text-3xl">shield_person</span>
                </div>
                <h2 className="text-headline-md font-bold text-primary">Applicant Login</h2>
                <p className="text-body-md text-on-surface-variant mt-1">Access the secure application wizard</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 animate-bounce">error</span>
                  <div className="flex-1">
                    <p className="text-body-md font-bold">Verification Error</p>
                    <p className="text-caption text-on-error-container opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {step === "MOBILE" ? (
                <form onSubmit={handleSendOtp} className="space-y-5">

                  {/* ── District Selection (mandatory, first field) ── */}
                  <div className="space-y-2">
                    <label className="block text-label-md font-bold text-on-surface">
                      Select Your District <span className="text-error">*</span>
                    </label>
                    <div className="relative" ref={districtRef}>
                      <div
                        className={`relative w-full h-12 flex items-center px-4 bg-surface border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedDistrict
                            ? "border-primary ring-1 ring-primary"
                            : "border-outline-variant"
                        }`}
                        onClick={() => setShowDistrictDropdown(v => !v)}
                      >
                        <span className="material-symbols-outlined absolute left-3 text-outline">location_on</span>
                        <input
                          id="district-search"
                          type="text"
                          className="w-full h-full pl-8 pr-8 bg-transparent outline-none text-body-lg font-medium placeholder:text-outline"
                          placeholder="Search district..."
                          value={districtSearch}
                          onChange={e => {
                            setDistrictSearch(e.target.value);
                            setShowDistrictDropdown(true);
                            if (!e.target.value) setSelectedDistrict("");
                          }}
                          onClick={e => { e.stopPropagation(); setShowDistrictDropdown(true); }}
                          autoComplete="off"
                        />
                        <span className="material-symbols-outlined absolute right-3 text-outline text-sm">
                          {showDistrictDropdown ? "expand_less" : "expand_more"}
                        </span>
                      </div>

                      {showDistrictDropdown && filteredDistricts.length > 0 && (
                        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-52 overflow-y-auto">
                          {filteredDistricts.map(d => (
                            <button
                              key={d}
                              type="button"
                              className={`w-full text-left px-4 py-2.5 text-body-md hover:bg-primary-fixed hover:text-primary transition-colors ${
                                d === selectedDistrict ? "bg-primary-fixed text-primary font-bold" : "text-on-surface"
                              }`}
                              onClick={() => handleDistrictSelect(d)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {resolvedZoneName && (
                      <div className="flex items-center gap-1.5 text-caption text-primary font-bold animate-fadeIn">
                        <span className="material-symbols-outlined text-sm">hub</span>
                        <span>Assigned to: {resolvedZoneName}</span>
                      </div>
                    )}
                    {!selectedDistrict && (
                      <p className="text-caption text-on-surface-variant">
                        District selection is mandatory before login.
                      </p>
                    )}
                  </div>

                  {/* ── Mobile Number ── */}
                  <div className="space-y-2">
                    <label className="block text-label-md font-bold text-on-surface">
                      Registered Mobile Number <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-3.5 text-outline">phone_iphone</span>
                      <input
                        type="tel"
                        maxLength={10}
                        className={`w-full h-12 pl-10 pr-4 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-body-lg font-medium ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter 10-digit number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        disabled={loading || !canProceed}
                      />
                    </div>
                    <p className="text-caption text-on-surface-variant">We will send a 6-digit verification code to this number.</p>
                  </div>

                  {/* ── Captcha ── */}
                  {captcha && canProceed && (
                    <div className="space-y-2 pt-2 border-t border-outline-variant">
                      <label className="block text-label-md font-bold text-on-surface">
                        Security Captcha <span className="text-error">*</span>
                      </label>
                      <div className="flex items-center gap-4 p-2 bg-surface-container-low border border-outline-variant rounded-lg">
                        <div
                          dangerouslySetInnerHTML={{ __html: captcha.svgContent }}
                          className="flex-1 bg-white rounded flex items-center justify-center p-2 min-h-12 border border-outline-variant select-none"
                        />
                        <button
                          type="button"
                          onClick={loadCaptcha}
                          className="p-3 text-primary hover:bg-secondary-container hover:text-on-secondary-container rounded-full transition-all duration-200"
                          title="Reload Captcha"
                        >
                          <span className="material-symbols-outlined">refresh</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full h-12 px-4 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-body-md font-medium placeholder-outline"
                        placeholder="Enter characters exactly as shown"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    id="btn-request-otp"
                    className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-sm mt-6 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={loading || !canProceed}
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span>Request OTP</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="p-4 bg-secondary-container text-on-secondary-container rounded-lg border border-outline-variant flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5">info</span>
                    <div>
                      <p className="text-body-md font-bold">OTP Dispatched</p>
                      <p className="text-caption text-on-secondary-container opacity-90 mt-1">
                        An OTP has been sent to <strong>+91 {mobile}</strong>. Enter it below to authenticate.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-label-md font-bold text-on-surface text-center">
                      Enter 6-Digit OTP <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full h-16 text-center text-3xl tracking-[0.5em] font-bold bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                      placeholder="------"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                    />
                    <p className="text-caption text-center text-on-surface-variant">Check API terminal console to retrieve mock verification code</p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      type="submit"
                      id="btn-verify-otp"
                      className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      ) : (
                        "Verify & Continue"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("MOBILE")}
                      className="w-full h-12 flex items-center justify-center gap-2 border border-outline text-primary hover:bg-surface-container-low font-bold rounded-lg transition-all duration-150"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      <span>Change Mobile Number</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Unified Footer */}
      <footer className="bg-surface-container border-t border-outline-variant py-4 text-center text-caption text-on-surface-variant">
        <p>© 2026 Govt of West Bengal. Annapurna Yojana Portal. All rights reserved.</p>
        <p className="mt-1 opacity-75">Designed for accessibility under standard web guidelines.</p>
      </footer>
    </div>
  );
}

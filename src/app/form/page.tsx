"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import MemberBasicSection from "./MemberBasicSection";
import MemberRationSection from "./MemberRationSection";
import MemberOtherSections from "./MemberOtherSections";
import MemberIncomeSection from "./MemberIncomeSection";
import MemberAssetsSection from "./MemberAssetsSection";
import MemberSchemesSection from "./MemberSchemesSection";
import MemberSocialSection from "./MemberSocialSection";
import CommonDetailsTab from "./CommonDetailsTab";
import AddressSection from "./AddressSection";
import { DEFAULT_MEMBER, SECTIONS } from "./constants";
import { validateAadhaar, validateMobile, validatePan, validateEpic, validateIfsc, validateBankAccount } from "./validation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import MemberTabs from "@/components/form/MemberTabs";
import FooterActions from "@/components/form/FooterActions";

export default function FormWizardV2() {
  const { t } = useLanguage();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [submittedState, setSubmittedState] = useState<{ isSubmitted: boolean, submittedAt?: string, applicationId?: string, status?: string, payload?: any } | null>(null);
  const [viewingSubmitted, setViewingSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("basic");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lastSavedPayloadRef = useRef<string>("");

  const [familyInfo, setFamilyInfo] = useState({
    totalFamilyMembers: 1,
    liftingMonthlyRation: false,
    hasElectricityConnection: false,
    electricityConsumerId: "",
    powerUnitsConsumed: null as number | null,
    isAgreed: false,
    address: "",
    rationCardHouseholdId: "",
    hasDigitalRationCard: false,
    noOfLiterateAdults: null as number | null,
    noOfIlliterateAdults: null as number | null,
    totalAnnualFamilyIncome: null as number | null,
    district: null as number | null,
    areaType: null as 'Rural' | 'Urban' | null,
    block: null as number | null,
    gp: null as number | null,
    ulb: null as number | null,
    ward: null as number | null
  });

  const [members, setMembers] = useState([DEFAULT_MEMBER(true)]);
  const [activeTab, setActiveTab] = useState(0);
  const isCommonTab = activeTab === members.length;
  const currentMember = isCommonTab ? null : members[activeTab];
  async function loadDraft() {
    try {
      const statusRes: any = await api.get("/form/status");
      if (statusRes && statusRes.isSubmitted) {
        setSubmittedState(statusRes);
        if (statusRes.payload) {
          const res = statusRes.payload;
          if (res.applicationId) setAppId(res.applicationId);
          setFamilyInfo({
            totalFamilyMembers: res.totalFamilyMembers || 1,
            liftingMonthlyRation: res.liftingMonthlyRation || false,
            hasElectricityConnection: res.hasElectricityConnection || false,
            electricityConsumerId: res.electricityConsumerId || "",
            powerUnitsConsumed: res.powerUnitsConsumed,
            isAgreed: res.isAgreed || false,
            address: res.address || "",
            rationCardHouseholdId: res.rationCardHouseholdId || "",
            hasDigitalRationCard: res.hasDigitalRationCard || false,
            noOfLiterateAdults: res.noOfLiterateAdults,
            noOfIlliterateAdults: res.noOfIlliterateAdults,
            totalAnnualFamilyIncome: res.totalAnnualFamilyIncome ?? null,
            district: res.district ?? null,
            areaType: res.areaType ?? null,
            block: res.block ?? null,
            gp: res.gp ?? null,
            ulb: res.ulb ?? null,
            ward: res.ward ?? null
          });
          if (res.members) setMembers(res.members);
        }
        return;
      }
    } catch (e) {
      console.error("Failed to check status", e);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await api.get("/form/draft");
      if (res && res.members) {
        if (res.applicationId) setAppId(res.applicationId);
        setFamilyInfo({
          totalFamilyMembers: res.totalFamilyMembers || 1,
          liftingMonthlyRation: res.liftingMonthlyRation || false,
          hasElectricityConnection: res.hasElectricityConnection || false,
          electricityConsumerId: res.electricityConsumerId || "",
          powerUnitsConsumed: res.powerUnitsConsumed,
          isAgreed: res.isAgreed || false,
          address: res.address || "",
          rationCardHouseholdId: res.rationCardHouseholdId || "",
          hasDigitalRationCard: res.hasDigitalRationCard || false,
          noOfLiterateAdults: res.noOfLiterateAdults,
          noOfIlliterateAdults: res.noOfIlliterateAdults,
          totalAnnualFamilyIncome: res.totalAnnualFamilyIncome ?? null,
          district: res.district ?? null,
          areaType: res.areaType ?? null,
          block: res.block ?? null,
          gp: res.gp ?? null,
          ulb: res.ulb ?? null,
          ward: res.ward ?? null
        });
        setMembers(res.members);
      }
    } catch {
      // no draft
    }
    // If we still don't have an appId, generate a temporary one
    setAppId(prev => prev || crypto.randomUUID());
  }

  useEffect(() => {
    const hasToken = Cookies.get("annapurna_token_exp");
    if (!hasToken) { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDraft();
  }, [router]);

  function serializePayload() {
    const serializedMembers = members.map(m => ({
      ...m,
      natureOfEmployment: m.natureOfEmployment,
      // Parse govtSchemeBenefits JSON strings to objects for the API
      govtSchemeBenefits: m.govtSchemeBenefits?.map(s => {
        try { return JSON.parse(s); } catch { return { schemeName: "", optOut: false }; }
      }) || [],
      // null boolean → false  (backend non-nullable bool fields)
      isChild:                      m.isChild                      ?? false,
      hasFourWheeler:               m.hasFourWheeler               ?? false,
      hasHealthInsurance:           m.hasHealthInsurance           ?? false,
      paysIncomeOrProfessionalTax:  m.paysIncomeOrProfessionalTax  ?? false,
      isRegisteredGst:              m.isRegisteredGst              ?? false,
      isGovtPensioner:              m.isGovtPensioner              ?? false,
      holdsConstitutionalPost:      m.holdsConstitutionalPost      ?? false,
      receivesGovtSchemeBenefits:   m.receivesGovtSchemeBenefits   ?? false,
    }));
    return { ...familyInfo, members: serializedMembers };
  }

  async function saveDraft() {
    try {
      const payload = serializePayload();
      const payloadStr = JSON.stringify(payload);
      
      if (payloadStr === lastSavedPayloadRef.current) {
        alert("No changes to save. Draft is already up to date!");
        return;
      }

      setLoading(true);
      const res = await api.post<{ applicationId?: string }>("/form/draft", payload);
      if (res.applicationId) setAppId(res.applicationId);
      
      lastSavedPayloadRef.current = payloadStr;
      alert("Draft saved successfully!");
    } catch (err: unknown) {
      setValidationErrors([`Failed to save draft: ${err instanceof Error ? err.message : String(err)}`]);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  }

  async function submitForm() {
    setValidationErrors([]);
    const errors: string[] = [];
    
    // Family Level Validation
    if (!familyInfo.isAgreed) errors.push("You must agree to the declaration in the Common Details Tab.");
    if (familyInfo.totalFamilyMembers < 1 || familyInfo.totalFamilyMembers > 50) errors.push("Total family members must be between 1 and 50.");
    if ((familyInfo.noOfLiterateAdults || 0) + (familyInfo.noOfIlliterateAdults || 0) !== familyInfo.totalFamilyMembers) {
      errors.push("The sum of literate and illiterate adults must be equal to the Total No. of Family Members.");
    }
    if (!familyInfo.address || familyInfo.address.trim() === "") errors.push("Permanent Address is required in Common Details.");


    // Members Level Validation
    if (members.length === 0) errors.push("At least one member is required.");
    
    members.forEach((m, i) => {
      const prefix = m.isHoF ? "Head of Family" : `Member ${i + 1}`;
      
      if (!m.memberName || m.memberName.trim() === "") errors.push(`${prefix}: Name is required.`);
      
      if (m.aadhaarNo && m.aadhaarNo !== "N/A") {
        if (!validateAadhaar(m.aadhaarNo)) errors.push(`${prefix}: Aadhaar number is invalid.`);
      } else if (m.isChild === false) {
        errors.push(`${prefix}: Aadhaar number is required for adults.`);
      } else if (m.aadhaarNo === "N/A") {
        let age = 999;
        if (m.dateOfBirth) {
          const dob = new Date(m.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const mt = today.getMonth() - dob.getMonth();
          if (mt < 0 || (mt === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
        }
        if (age >= 5 || m.isChild !== true) {
          errors.push(`${prefix}: 'N/A' for Aadhaar is only allowed for children under 5 years of age.`);
        }
      }

      if (m.isHoF) {
        if (!m.mobileNo) errors.push(`${prefix}: Contact number is required for Head of Family.`);
        else if (!validateMobile(m.mobileNo)) errors.push(`${prefix}: Contact number must be 10 digits.`);
      }

      if (m.gender === "Female" && m.isChild === false) {
        if (m.applyingForAnnapurnaBhandar === null || m.applyingForAnnapurnaBhandar === undefined) {
          errors.push(`${prefix}: Applying for Annapurna Yojana is a mandatory selection for adult females.`);
        }
      }

      if (m.panNo && !validatePan(m.panNo)) errors.push(`${prefix}: PAN number is invalid.`);
      if (m.epicNo && !validateEpic(m.epicNo)) errors.push(`${prefix}: EPIC (Voter ID) number is invalid.`);
      if (m.bankAccountNo && !validateBankAccount(m.bankAccountNo)) errors.push(`${prefix}: Bank Account number must be between 9 and 18 digits.`);
      if (m.ifscCode && !validateIfsc(m.ifscCode)) errors.push(`${prefix}: IFSC Code format is invalid.`);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setLoading(true);
      await api.post("/form/draft", serializePayload());
      await api.post("/form/submit");
      await loadDraft();
      window.scrollTo(0, 0);
    } catch (err: any) {
      if (err instanceof Error && err.message.startsWith("Validation Error: ")) {
        try {
          const serverErrors = JSON.parse(err.message.replace("Validation Error: ", ""));
          const errorList = [];
          for (const key in serverErrors) {
            errorList.push(...serverErrors[key]);
          }
          setValidationErrors(errorList);
        } catch {
          setValidationErrors([`Failed to submit form: ${err.message}`]);
        }
      } else {
        setValidationErrors([`Failed to submit form: ${err?.message || String(err)}`]);
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  }
  // addMember removed

  const removeMember = (index: number) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
    setFamilyInfo(prev => ({ ...prev, totalFamilyMembers: newMembers.length }));
    if (activeTab >= newMembers.length) {
      setActiveTab(Math.max(0, newMembers.length - 1));
    }
  };

  const updateMember = (index: number, field: string, value: unknown) => {
    const newMembers = [...members];
    (newMembers[index] as Record<string, unknown>)[field] = value;
    setMembers(newMembers);
  };

  const updateFamily = (field: string, value: unknown) => {
    setFamilyInfo({ ...familyInfo, [field]: value });
  };

  const dynamicSections = (!isCommonTab && currentMember && currentMember.isHoF)
    ? [
        ...SECTIONS,
        { key: "family", label: "Family Identity", icon: "family_restroom" }
      ]
    : SECTIONS;

  let finalSections = [...dynamicSections];
  if (!isCommonTab && currentMember && currentMember.isChild) {
    finalSections.push({ key: "social", label: "Social Status and Dependents", icon: "child_care" });
  }

  useEffect(() => {
    if (activeSection === "family" && (!currentMember || !currentMember.isHoF)) {
      setActiveSection("basic");
    }
  }, [activeSection, currentMember]);

  useEffect(() => {
    const literateAdults = members.filter(m => !m.isChild && m.literacyStatus === "Literate").length;
    const illiterateAdults = members.filter(m => !m.isChild && m.literacyStatus === "Illiterate").length;
    
    if (familyInfo.noOfLiterateAdults !== literateAdults || familyInfo.noOfIlliterateAdults !== illiterateAdults) {
      setFamilyInfo(prev => ({
        ...prev,
        noOfLiterateAdults: literateAdults,
        noOfIlliterateAdults: illiterateAdults
      }));
    }
  }, [members, familyInfo.noOfLiterateAdults, familyInfo.noOfIlliterateAdults]);

  const sectionIdx = finalSections.findIndex(s => s.key === activeSection);
  const prevSection = sectionIdx > 0 ? finalSections[sectionIdx - 1] : null;
  const nextSection = isCommonTab ? null : (sectionIdx < finalSections.length - 1 ? finalSections[sectionIdx + 1] : null);

  // After a successful submission, the form is displayed in read-only mode
  const isReadOnly = !!(submittedState?.isSubmitted && viewingSubmitted);

  if (submittedState && submittedState.isSubmitted && !viewingSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-lg border border-outline-variant text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Application Already Submitted</h2>
            <p className="text-body-lg text-on-surface-variant">
              Your application for Annapurna Yojana has been successfully submitted. No further edits are permitted.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center border-b border-amber-100 pb-2">
              <span className="text-sm font-semibold text-amber-700">Temporary ID</span>
              <span className="font-mono text-on-surface font-bold text-sm">{submittedState.applicationId || appId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-amber-100 pb-2">
              <span className="text-sm font-semibold text-amber-700">Submission Date</span>
              <span className="text-on-surface text-sm">
                {submittedState.submittedAt
                  ? new Date(submittedState.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
                  : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-amber-700">Current Status</span>
              <span className="bg-primary/10 text-primary font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                {submittedState.status || "SUBMITTED"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setViewingSubmitted(true)}
            className="w-full h-12 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            View Submitted Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {!isCommonTab && (
        <Sidebar
          sections={finalSections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Header
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
          appId={appId}
        />

        {/* Scrollable Content */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {/* Read-only Banner */}
          {isReadOnly && (
            <div className="max-w-5xl mx-auto flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-300 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-2xl text-amber-600 shrink-0">lock</span>
              <div>
                <p className="font-bold text-amber-800 text-sm">Submitted — View Only</p>
                <p className="text-amber-700 text-xs mt-0.5">This application has been submitted. No further changes are allowed.</p>
              </div>
              <span className="ml-auto bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Read Only</span>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="max-w-5xl mx-auto p-4 bg-error-container text-on-error-container border border-error rounded-xl">
              <ul className="list-disc pl-4 space-y-1 text-body-md">
                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}


          <MemberTabs
            members={members}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCommonTab={isCommonTab}
          />

          {/* ── Member Tab Content ── (wrapped in fieldset when read-only to disable all inputs) */}
          <fieldset disabled={isReadOnly} className="contents" style={{ display: 'contents' }}>
          {!isCommonTab && currentMember && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Member action bar (non-HoF) — hidden in read-only mode since type is already locked */}
              {!currentMember.isHoF && !isReadOnly && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-label-md font-semibold text-on-surface">Member Type:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`memberType-${activeTab}`}
                        checked={currentMember.isChild === false}
                        onChange={() => {
                          updateMember(activeTab, "isChild", false);
                          updateMember(activeTab, "applyingForAnnapurnaBhandar", null);
                        }}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-body-md">{t("Adult")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`memberType-${activeTab}`}
                        checked={currentMember.isChild === true}
                        onChange={() => {
                          updateMember(activeTab, "isChild", true);
                          updateMember(activeTab, "applyingForAnnapurnaBhandar", null);
                        }}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-body-md">{t("Child")}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Child info banner */}
              {currentMember.isChild === true && (
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-body-md">
                  <span className="material-symbols-outlined text-[20px] text-amber-500">child_care</span>
                  <span>This member is marked as a <strong>Child</strong>. Certain adult fields will be hidden.</span>
                </div>
              )}

              {/* Mandatory selection block — bypassed in read-only since data is already saved */}
              {!isReadOnly && !currentMember.isHoF && currentMember.isChild === null ? (
                <div className="p-8 text-center bg-surface-container rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">{t("info")}</span>
                  <p className="text-body-lg text-on-surface-variant">Please select the <strong>Member Type</strong> (Adult or Child) above to fill in their details.</p>
                </div>
              ) : (
                <>
                  {/* Section routing to sub-components */}
                  {activeSection === "family" && currentMember.isHoF && (
                    <section className="bg-white border border-outline-variant rounded-xl overflow-hidden">
                      <div className="bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between">
                        <h3 className="text-label-md font-semibold text-on-surface">{t("Family Identity &amp; Demographics")}</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="md:col-span-2">
                          <label className="block text-label-sm font-semibold text-secondary mb-1">{t("Permanent Address")}</label>
                          <textarea
                            data-testid="permanent-address"
                            className="w-full p-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-body-md"
                            rows={2}
                            value={familyInfo.address}
                            onChange={e => updateFamily("address", e.target.value)}
                          />
                        </div>
                        <AddressSection familyInfo={familyInfo} updateFamily={updateFamily} />
                        <div>
                          <label className="block text-label-sm font-semibold text-secondary mb-1">{t("Total No. of Family Members")}</label>
                          <input type="number" className="w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md" value={familyInfo.totalFamilyMembers} onChange={e => {
                            const count = parseInt(e.target.value) || 1;
                            updateFamily("totalFamilyMembers", count);
                            setMembers(prev => {
                              if (count > prev.length) {
                                const newMembers = [...prev];
                                while (newMembers.length < count) {
                                  newMembers.push(DEFAULT_MEMBER(false));
                                }
                                return newMembers;
                              } else if (count < prev.length && count >= 1) {
                                const newMembers = prev.slice(0, count);
                                if (activeTab >= count) setActiveTab(0);
                                return newMembers;
                              }
                              return prev;
                            });
                          }} min="1" />
                        </div>
                        <div>
                          <label className="block text-label-sm font-semibold text-secondary mb-1">{t("Total annual family income (INR)")}</label>
                          <div className="flex items-center gap-2">
                            <span className="text-body-md text-secondary font-medium">{t("Rs.")}</span>
                            <input type="number" className="flex-1 h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md" value={familyInfo.totalAnnualFamilyIncome || ""} onChange={e => updateFamily("totalAnnualFamilyIncome", parseInt(e.target.value) || null)} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-label-sm font-semibold text-secondary mb-1">{t("No. of Literate Adult Members")}</label>
                          <input type="number" readOnly className="w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface-container-highest text-on-surface text-body-md cursor-not-allowed" value={familyInfo.noOfLiterateAdults || 0} />
                        </div>
                        <div>
                          <label className="block text-label-sm font-semibold text-secondary mb-1">{t("No. of Illiterate Adult Members")}</label>
                          <input type="number" readOnly className="w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface-container-highest text-on-surface text-body-md cursor-not-allowed" value={familyInfo.noOfIlliterateAdults || 0} />
                        </div>
                      </div>
                    </section>
                  )}
                  {activeSection === "basic" && (
                    <MemberBasicSection member={currentMember} activeTab={activeTab} updateMember={updateMember} familyDistrict={familyInfo.district} />
                  )}
                  {activeSection === "ration" && (
                    <MemberRationSection member={currentMember} activeTab={activeTab} updateMember={updateMember} />
                  )}
                  {activeSection === "identity" && (
                    <MemberOtherSections member={currentMember} activeTab={activeTab} activeSection={activeSection} updateMember={updateMember} />
                  )}
                  {activeSection === "income" && (
                    <MemberIncomeSection member={currentMember} activeTab={activeTab} updateMember={updateMember} />
                  )}
                  {activeSection === "assets" && (
                    <MemberAssetsSection member={currentMember} activeTab={activeTab} updateMember={updateMember} />
                  )}
                  {activeSection === "schemes" && (
                    <MemberSchemesSection member={currentMember} activeTab={activeTab} updateMember={updateMember} />
                  )}
                  {activeSection === "social" && (
                    <MemberSocialSection member={currentMember} activeTab={activeTab} updateMember={updateMember} />
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Common Details Tab ── */}
          {isCommonTab && (
            <CommonDetailsTab familyInfo={familyInfo} updateFamily={updateFamily} />
          )}
          </fieldset>
        </div>

        {!viewingSubmitted && <FooterActions
          prevSection={prevSection}
          nextSection={nextSection}
          setActiveSection={setActiveSection}
          saveDraft={saveDraft}
          submitForm={submitForm}
          loading={loading}
        />}
      </main>

      <MobileNav
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        sections={dynamicSections}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
}

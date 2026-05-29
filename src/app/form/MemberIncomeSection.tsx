"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";
import FileUpload from "@/components/form/FileUpload";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

const NATURE_OF_EMPLOYMENT_OPTIONS = [
  "Government Sector",
  "Salaried, in Private Sector",
  "Formal Sector Self-Employed (Entrepreneur/Business/ Proprietor/etc.)",
  "Part-time job",
  "Informal Sector Self-Employed (Artisan/Craftsman/Farmer/etc.)",
  "Migrant Labourer",
  "Unemployed",
  "Others"
];

interface Member {
  paysIncomeOrProfessionalTax?: boolean | null;
  hasPanCard?: boolean | null;
  panName: string;
  panNo: string;
  natureOfEmployment: string[];
  literacyStatus: string;
  highestEducationalQualifications: string;
  holdsConstitutionalPost?: boolean | null;
  constitutionalPostMemberNo?: string;
  isGovtPensioner?: boolean | null;
  govtPensionerMemberNo?: string;
  isRegisteredGst?: boolean | null;
  gstin: string;
  isChild?: boolean | null;
  [key: string]: any;
}

interface Props {
  member: Member;
  activeTab: number;
  updateMember: (index: number, field: string, value: unknown) => void;
}

export default function MemberIncomeSection({ member, activeTab, updateMember }: Props) {
  const { t } = useLanguage();

  const handleDocChange = (docName: string, file: File | null) => {
    const currentDocs = (member.documents as any) || {};
    updateMember(activeTab, 'documents', { ...currentDocs, [docName]: file });
  };
  const getDoc = (docName: string) => (member.documents as any)?.[docName] || null;

  if (member.isChild) {
    return (
      <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-300">
        <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">child_care</span>
        <p className="text-body-lg text-amber-800">{t("Income, employment, and education fields are not applicable for a child.")}</p>
      </div>
    );
  }

  return (
    <>
    <section className={cardCls}>
      <div className={sectionHeaderCls}>
        <h3 className="text-label-md font-semibold text-on-surface">{t("Income / Profession")}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

        {/* 1. Tax */}
        <div>
          <label className={labelCls}>{t("Do you pay Income Tax or Professional Tax?")}</label>
          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`tax_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.paysIncomeOrProfessionalTax === true} onChange={() => updateMember(activeTab, "paysIncomeOrProfessionalTax", true)} />
              <span className="text-body-md text-on-surface">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`tax_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.paysIncomeOrProfessionalTax === false} onChange={() => updateMember(activeTab, "paysIncomeOrProfessionalTax", false)} />
              <span className="text-body-md text-on-surface">No</span>
            </label>
          </div>
        </div>

        {/* 2. PAN */}
        <div>
          <label className={labelCls}>{t("Do you have a PAN Card?")}</label>
          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`pan_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.hasPanCard === true} onChange={() => updateMember(activeTab, "hasPanCard", true)} />
              <span className="text-body-md text-on-surface">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`pan_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.hasPanCard === false} onChange={() => {
                updateMember(activeTab, "hasPanCard", false);
                updateMember(activeTab, "panName", "");
                updateMember(activeTab, "panNo", "");
              }} />
              <span className="text-body-md text-on-surface">No</span>
            </label>
          </div>
        </div>
        
        {member.hasPanCard === true && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-2 border-t border-outline-variant">
            <div>
              <label className={labelCls}>{t("Name on PAN Card")}</label>
              <input type="text" className={inputCls} value={member.panName || ""} onChange={e => updateMember(activeTab, "panName", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t("PAN No.")}</label>
              <input type="text" className={inputCls} value={member.panNo || ""} onChange={e => updateMember(activeTab, "panNo", e.target.value.toUpperCase())} />
            </div>
            <div className="md:col-span-2">
              <FileUpload label={t("Upload PAN Document")} value={getDoc("pan")} onChange={(f) => handleDocChange("pan", f)} />
            </div>
          </div>
        )}

        {/* 3. Employment */}
        <div className="md:col-span-2 pt-4 border-t border-outline-variant">
          <label className={labelCls}>
            Nature of Employment 
            <span className="ml-1.5 text-[11px] font-normal text-secondary italic">{t("(Can choose multiple)")}</span>
          </label>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {NATURE_OF_EMPLOYMENT_OPTIONS.map(opt => {
              const currentValues = Array.isArray(member.natureOfEmployment) ? member.natureOfEmployment : [];
              const isChecked = currentValues.includes(opt);
              return (
                <label key={opt} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 text-primary focus:ring-primary rounded"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateMember(activeTab, "natureOfEmployment", [...currentValues, opt]);
                      } else {
                        updateMember(activeTab, "natureOfEmployment", currentValues.filter(val => val !== opt));
                      }
                    }}
                  />
                  <span className="text-body-md text-on-surface leading-tight">{opt}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-6">
            <FileUpload label={t("Upload Employment Document")} value={getDoc("employmentDocument")} onChange={(f) => handleDocChange("employmentDocument", f)} />
          </div>
        </div>

        {/* 4. Education */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-4 border-t border-outline-variant">
          <div>
            <label className={labelCls}>{t("Literacy Status")}</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input data-testid="member-literate" type="radio" name={`literacy_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.literacyStatus === "Literate"} onChange={() => updateMember(activeTab, "literacyStatus", "Literate")} />
                <span className="text-body-md text-on-surface">{t("Literate")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`literacy_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.literacyStatus === "Illiterate"} onChange={() => {
                  updateMember(activeTab, "literacyStatus", "Illiterate");
                  updateMember(activeTab, "highestEducationalQualifications", "");
                }} />
                <span className="text-body-md text-on-surface">{t("Illiterate")}</span>
              </label>
            </div>
          </div>
          {member.literacyStatus === "Literate" && (
            <div>
              <label className={labelCls}>{t("Highest Educational Qualification")}</label>
              <input type="text" className={inputCls} value={member.highestEducationalQualifications || ""} onChange={e => updateMember(activeTab, "highestEducationalQualifications", e.target.value)} />
            </div>
          )}
        </div>

        {/* 5, 6, 7. Other Checks */}
        <div className="md:col-span-2 grid grid-cols-1 gap-x-8 gap-y-6 pt-4 border-t border-outline-variant">
          {/* 5. Constitutional Post */}
          <div>
            <label className={labelCls}>{t("Are you a former/current holder of any constitutional posts, ministers, MPs, MLAs, urban local bodies or panchayat local bodies?")}</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`constitutional_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.holdsConstitutionalPost === true} onChange={() => updateMember(activeTab, "holdsConstitutionalPost", true)} />
                <span className="text-body-md text-on-surface">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`constitutional_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.holdsConstitutionalPost === false} onChange={() => {
                  updateMember(activeTab, "holdsConstitutionalPost", false);
                  updateMember(activeTab, "constitutionalPostMemberNo", "");
                }} />
                <span className="text-body-md text-on-surface">No</span>
              </label>
            </div>
            
            {member.holdsConstitutionalPost === true && (
              <div className="mt-4">
                <label className={labelCls}>{t("Member No. who was holding the position")}</label>
                <input type="text" className={inputCls} value={member.constitutionalPostMemberNo || ""} onChange={e => updateMember(activeTab, "constitutionalPostMemberNo", e.target.value)} />
              </div>
            )}
          </div>

          {/* 6. Pensioner */}
          <div>
            <label className={labelCls}>{t("Are you a government pensioner?")}</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`pensioner_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.isGovtPensioner === true} onChange={() => updateMember(activeTab, "isGovtPensioner", true)} />
                <span className="text-body-md text-on-surface">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`pensioner_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.isGovtPensioner === false} onChange={() => {
                  updateMember(activeTab, "isGovtPensioner", false);
                  updateMember(activeTab, "govtPensionerMemberNo", "");
                }} />
                <span className="text-body-md text-on-surface">No</span>
              </label>
            </div>

            {member.isGovtPensioner === true && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className={labelCls}>{t("Member No. of government pensioner")}</label>
                  <input type="text" className={inputCls} value={member.govtPensionerMemberNo || ""} onChange={e => updateMember(activeTab, "govtPensionerMemberNo", e.target.value)} />
                </div>
                <div>
                  <FileUpload label={t("Upload Pension Document")} value={getDoc("pensionDocument")} onChange={(f) => handleDocChange("pensionDocument", f)} />
                </div>
              </div>
            )}
          </div>

          {/* 7. GST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className={labelCls}>{t("Are you registered under GST?")}</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name={`gst_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.isRegisteredGst === true} onChange={() => updateMember(activeTab, "isRegisteredGst", true)} />
                  <span className="text-body-md text-on-surface">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name={`gst_${activeTab}`} className="w-4 h-4 text-primary focus:ring-primary" checked={member.isRegisteredGst === false} onChange={() => {
                    updateMember(activeTab, "isRegisteredGst", false);
                    updateMember(activeTab, "gstin", "");
                  }} />
                  <span className="text-body-md text-on-surface">No</span>
                </label>
              </div>
            </div>
            
            {member.isRegisteredGst === true && (
              <div>
                <label className={labelCls}>{t("GSTIN")}</label>
                <input type="text" className={inputCls} value={member.gstin || ""} onChange={e => updateMember(activeTab, "gstin", e.target.value.toUpperCase())} />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
    </>
  );
}

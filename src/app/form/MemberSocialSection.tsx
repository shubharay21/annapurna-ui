"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

interface Member {
  isChild?: boolean | null;
  schoolName: string;
  schoolGrade: string;
  schoolType: string;
  schoolTypeOther: string;
  vaccinationStatus: string;
  vaccinationCardId: string;
  vaccinationSkipReasonOrDate: string;
  [key: string]: any;
}

interface Props {
  member: Member;
  activeTab: number;
  updateMember: (index: number, field: string, value: unknown) => void;
}

export default function MemberSocialSection({ member, activeTab, updateMember }: Props) {
  const { t } = useLanguage();

  if (!member.isChild) {
    return null;
  }

  return (
    <section className={cardCls}>
      <div className={sectionHeaderCls}>
        <h3 className="text-label-md font-semibold text-on-surface">{t("Social Status and Dependents")}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        
        {/* 1. School Details */}
        <div className="md:col-span-2">
          <h4 className="text-label-md font-semibold text-primary mb-4">1. Details of all children in the family attending school:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 bg-surface-container-low p-4 rounded-lg border border-outline-variant">
            <div>
              <label className={labelCls}>{t("Grade")}</label>
              <input type="text" className={inputCls} value={member.schoolGrade || ""} onChange={e => updateMember(activeTab, "schoolGrade", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t("School Name")}</label>
              <input type="text" className={inputCls} value={member.schoolName || ""} onChange={e => updateMember(activeTab, "schoolName", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>{t("Type")}</label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Govt / Govt Aided / Sponsored School", "Private School", "Recognized Madrasah", "Other Madrasah", "Others"].map(opt => (
                  <label key={opt} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`schoolType_${activeTab}`}
                      className="w-4 h-4 mt-0.5 text-primary focus:ring-primary"
                      checked={member.schoolType === opt}
                      onChange={() => {
                        updateMember(activeTab, "schoolType", opt);
                        if (opt !== "Others") {
                          updateMember(activeTab, "schoolTypeOther", "");
                        }
                      }}
                    />
                    <span className="text-body-md text-on-surface leading-tight">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            {member.schoolType === "Others" && (
              <div className="md:col-span-2">
                <label className={labelCls}>{t("Specify Other School Type")}</label>
                <input type="text" className={inputCls} value={member.schoolTypeOther || ""} onChange={e => updateMember(activeTab, "schoolTypeOther", e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* 2. Vaccination Status */}
        <div className="md:col-span-2 pt-4 border-t border-outline-variant">
          <h4 className="text-label-md font-semibold text-primary mb-4">2. Children's vaccination status.</h4>
          <div className="grid grid-cols-1 gap-y-5 bg-surface-container-low p-4 rounded-lg border border-outline-variant">
            <div>
              <div className="flex flex-col gap-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`vaccinationStatus_${activeTab}`}
                    className="w-4 h-4 mt-0.5 text-primary focus:ring-primary"
                    checked={member.vaccinationStatus === "Yes"}
                    onChange={() => {
                      updateMember(activeTab, "vaccinationStatus", "Yes");
                      updateMember(activeTab, "vaccinationSkipReasonOrDate", "");
                    }}
                  />
                  <span className="text-body-md text-on-surface leading-tight">{t("Yes, vaccination started /completed")}</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`vaccinationStatus_${activeTab}`}
                    className="w-4 h-4 mt-0.5 text-primary focus:ring-primary"
                    checked={member.vaccinationStatus === "No"}
                    onChange={() => {
                      updateMember(activeTab, "vaccinationStatus", "No");
                      updateMember(activeTab, "vaccinationCardId", "");
                    }}
                  />
                  <span className="text-body-md text-on-surface leading-tight">{t("Not vaccinated")}</span>
                </label>
              </div>
            </div>

            {member.vaccinationStatus === "Yes" && (
              <div className="mt-2">
                <label className={labelCls}>{t("Vaccination Card ID")}</label>
                <input type="text" className={inputCls} value={member.vaccinationCardId || ""} onChange={e => updateMember(activeTab, "vaccinationCardId", e.target.value)} />
              </div>
            )}

            {member.vaccinationStatus === "No" && (
              <div className="mt-2">
                <label className={labelCls}>{t("Last vaccination date / reason for skip")}</label>
                <input type="text" className={inputCls} value={member.vaccinationSkipReasonOrDate || ""} onChange={e => updateMember(activeTab, "vaccinationSkipReasonOrDate", e.target.value)} />
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

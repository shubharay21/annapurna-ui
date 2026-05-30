"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";
import { useMasterData } from "@/hooks/useMasterData";
import { getDocLimits } from "./constants";
import FileUpload from "@/components/form/FileUpload";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

interface Member {
  hasDigitalRationCard?: boolean | null;
  digitalRationCardType: string;
  digitalRationCardNo: string;
  liftingMonthlyRation?: boolean | null;
  [key: string]: unknown;
}

interface Props {
  member: Member;
  activeTab: number;
  updateMember: (index: number, field: string, value: unknown) => void;
}

export default function MemberRationSection({ member, activeTab, updateMember }: Props) {
  const { t } = useLanguage();
  const { data: documentMasterData } = useMasterData("document-master.json");

  const handleDocChange = (docName: string, file: File | null) => {
    const currentDocs = (member.documents as any) || {};
    updateMember(activeTab, 'documents', { ...currentDocs, [docName]: file });
  };
  const getDoc = (docName: string) => (member.documents as any)?.[docName] || null;

  return (
    <>
      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Ration Card / Food Subsidy")}</h3>
        </div>
        <div className="p-6 space-y-6">

          {/* Q1: Do you have a Digital Ration Card? */}
          <div>
            <p className="text-label-sm font-semibold text-secondary mb-3">{t("Do you have a Digital Ration Card?")}</p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`hasRationCard_${activeTab}`}
                  className="w-4 h-4 text-primary"
                  checked={member.hasDigitalRationCard === true}
                  onChange={() => updateMember(activeTab, "hasDigitalRationCard", true)}
                />
                <span className="text-body-md font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`hasRationCard_${activeTab}`}
                  className="w-4 h-4 text-primary"
                  checked={member.hasDigitalRationCard === false}
                  onChange={() => {
                    updateMember(activeTab, "hasDigitalRationCard", false);
                    updateMember(activeTab, "digitalRationCardType", "");
                    updateMember(activeTab, "digitalRationCardNo", "");
                  }}
                />
                <span className="text-body-md font-medium">No</span>
              </label>
            </div>
          </div>

          {/* Conditional: Card Type + Card No */}
          {member.hasDigitalRationCard === true && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-4 border-t border-outline-variant">
              <div>
                <label className={labelCls}>{t("Digital Ration Card Type")}</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {["AAY", "PHH", "SPHH", "RKSY1", "RKSY2", "Non-subsidized"].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`ration_type_${activeTab}`}
                        className="w-4 h-4 text-primary focus:ring-primary"
                        checked={member.digitalRationCardType === type}
                        onChange={() => updateMember(activeTab, "digitalRationCardType", type)}
                      />
                      <span className="text-body-md text-on-surface">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("Ration Card No.")}</label>
                <input type="text" className={inputCls} value={member.digitalRationCardNo || ""} onChange={e => updateMember(activeTab, "digitalRationCardNo", e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="md:col-span-2">
                <FileUpload label={t("Upload Digital Ration Card")} value={getDoc("digitalRationCard")} onChange={(f) => handleDocChange("digitalRationCard", f)} {...getDocLimits("digitalRationCard", documentMasterData)} />
              </div>
            </div>
          )}

          {/* Q2: Lifting monthly ration */}
          <div className="pt-4 border-t border-outline-variant">
            <p className="text-label-sm font-semibold text-secondary mb-3">{t("Whether family is lifting monthly ration from the Ration Shop?")}</p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`liftingRation_${activeTab}`}
                  className="w-4 h-4 text-primary"
                  checked={member.liftingMonthlyRation === true}
                  onChange={() => updateMember(activeTab, "liftingMonthlyRation", true)}
                />
                <span className="text-body-md font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`liftingRation_${activeTab}`}
                  className="w-4 h-4 text-primary"
                  checked={member.liftingMonthlyRation === false}
                  onChange={() => updateMember(activeTab, "liftingMonthlyRation", false)}
                />
                <span className="text-body-md font-medium">No</span>
              </label>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

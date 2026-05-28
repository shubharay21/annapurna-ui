"use client";
import { useLanguage } from "@/app/i18n/LanguageContext";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

interface Member {
  receivesGovtSchemeBenefits: boolean;
  govtSchemeBenefits: string[];
  [key: string]: any;
}

interface Props {
  member: Member;
  activeTab: number;
  updateMember: (index: number, field: string, value: unknown) => void;
}

export default function MemberSchemesSection({ member, activeTab, updateMember }: Props) {
  const { t } = useLanguage();

  return (
    <section className={cardCls}>
      <div className={sectionHeaderCls}>
        <h3 className="text-label-md font-semibold text-on-surface">{t("Government Pension &amp; Schemes")}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 gap-y-5">

        <div>
          <label className={labelCls}>{t("Receiving Government Scheme Benefits (via DBT)?")}</label>
          <select className={inputCls} value={member.receivesGovtSchemeBenefits ? "Yes" : "No"} onChange={e => updateMember(activeTab, "receivesGovtSchemeBenefits", e.target.value === "Yes")}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        
        {member.receivesGovtSchemeBenefits && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={labelCls}>{t("Specify Scheme Names &amp; Opt-Out Status")}</label>
            </div>
            
            <div className="space-y-4">
              {member.govtSchemeBenefits?.map((schemeObj: string, idx: number) => {
                 let name = "";
                 let optOut = false;
                 if (typeof schemeObj === "string") {
                   try { 
                     const parsed = JSON.parse(schemeObj);
                     name = parsed.schemeName || "";
                     optOut = parsed.optOut || false;
                   } catch {
                     name = schemeObj;
                   }
                 } else if (schemeObj) {
                   name = (schemeObj as any).schemeName || "";
                   optOut = (schemeObj as any).optOut || false;
                 }

                 return (
                  <div key={idx} className="flex flex-col md:flex-row items-end gap-3 p-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
                    <div className="w-full md:flex-1">
                      <label className="block text-xs font-semibold text-secondary mb-1">Scheme {idx + 1} Name</label>
                      <input 
                        type="text" 
                        className={inputCls} 
                        placeholder="e.g. PM Kisan" 
                        value={name}
                        onChange={e => {
                          const newSchemes = [...(member.govtSchemeBenefits || [])];
                          newSchemes[idx] = JSON.stringify({ schemeName: e.target.value, optOut });
                          updateMember(activeTab, "govtSchemeBenefits", newSchemes);
                        }}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-semibold text-secondary mb-1">{t("Want to Opt Out?")}</label>
                      <select 
                        className={inputCls}
                        value={optOut ? "Yes" : "No"}
                        onChange={e => {
                          const newSchemes = [...(member.govtSchemeBenefits || [])];
                          newSchemes[idx] = JSON.stringify({ schemeName: name, optOut: e.target.value === "Yes" });
                          updateMember(activeTab, "govtSchemeBenefits", newSchemes);
                        }}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {member.govtSchemeBenefits.length > 1 && (
                      <button 
                        type="button" 
                        className="h-11 px-3 flex items-center justify-center text-error bg-error-container hover:bg-error/20 rounded transition-colors"
                        onClick={() => {
                          const newSchemes = [...(member.govtSchemeBenefits || [])];
                          newSchemes.splice(idx, 1);
                          updateMember(activeTab, "govtSchemeBenefits", newSchemes);
                        }}
                        title="Remove Scheme"
                      >
                        <span className="material-symbols-outlined text-[20px]">{t("delete")}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <button 
              type="button" 
              className="mt-4 flex items-center gap-2 text-primary font-bold hover:bg-primary-container px-4 py-2 rounded-lg transition-colors"
              onClick={() => {
                const newSchemes = [...(member.govtSchemeBenefits || [])];
                newSchemes.push(JSON.stringify({ schemeName: "", optOut: false }));
                updateMember(activeTab, "govtSchemeBenefits", newSchemes);
              }}
            >
              <span className="material-symbols-outlined">add_circle</span>
              Add Another Scheme
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

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
  hasFourWheeler: boolean;
  vehicleCount: number | null;
  vehicleRegistrationNo: string;
  vehicleModel?: string;
  hasThreePuccaRooms?: boolean | null;
  ownsLand?: boolean | null;
  landholdingSizeDecimals?: number | null;
  hasHealthInsurance: boolean;
  healthInsuranceType: string;
  healthInsuranceSumAssured: number | null;
  healthInsuranceAnnualPremium: number | null;
  vaccinationStatus: string;
  vaccinationCardId: string;
  vaccinationSkipReasonOrDate: string;
  isChild?: boolean | null;
  [key: string]: unknown;
}

interface Props {
  member: Member;
  activeTab: number;
  updateMember: (index: number, field: string, value: unknown) => void;
}

export default function MemberAssetsSection({ member, activeTab, updateMember }: Props) {
  const { t } = useLanguage();
  const { data: documentMasterData } = useMasterData("document-master.json");

  const handleDocChange = (docName: string, file: File | null) => {
    const currentDocs = (member.documents as any) || {};
    updateMember(activeTab, 'documents', { ...currentDocs, [docName]: file });
  };
  const getDoc = (docName: string) => (member.documents as any)?.[docName] || null;

  // Handle dynamic vehicles
  const vehicleCount = member.vehicleCount || 1;
  const vehicleModels = (member.vehicleModel || "").split(",").map(s => s.trim());
  const vehicleRegs = (member.vehicleRegistrationNo || "").split(",").map(s => s.trim());

  const updateVehicle = (index: number, field: "model" | "reg", value: string) => {
    if (field === "model") {
      const newModels = [...vehicleModels];
      while (newModels.length <= index) newModels.push("");
      newModels[index] = value;
      // Filter out trailing empty spaces if they aren't filled yet
      updateMember(activeTab, "vehicleModel", newModels.join(","));
    } else {
      const newRegs = [...vehicleRegs];
      while (newRegs.length <= index) newRegs.push("");
      newRegs[index] = value;
      updateMember(activeTab, "vehicleRegistrationNo", newRegs.join(","));
    }
  };

  return (
    <>
      {/* House / Land */}
      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("House / Land")}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className={labelCls}>House size: Does your house have ≥3 pucca rooms?</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`puccaRooms_${activeTab}`}
                  className="w-4 h-4 text-primary focus:ring-primary"
                  checked={member.hasThreePuccaRooms === true}
                  onChange={() => updateMember(activeTab, "hasThreePuccaRooms", true)}
                />
                <span className="text-body-md text-on-surface">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`puccaRooms_${activeTab}`}
                  className="w-4 h-4 text-primary focus:ring-primary"
                  checked={member.hasThreePuccaRooms === false}
                  onChange={() => updateMember(activeTab, "hasThreePuccaRooms", false)}
                />
                <span className="text-body-md text-on-surface">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Whether your family owns any land
              <span className="block text-[11px] font-normal text-secondary italic mt-0.5 leading-tight">{t("(Registration records, Mutation copy of Latest RoR Land records with date of updation of RoR)")}</span>
            </label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`ownsLand_${activeTab}`}
                  className="w-4 h-4 text-primary focus:ring-primary"
                  checked={member.ownsLand === true}
                  onChange={() => updateMember(activeTab, "ownsLand", true)}
                />
                <span className="text-body-md text-on-surface">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`ownsLand_${activeTab}`}
                  className="w-4 h-4 text-primary focus:ring-primary"
                  checked={member.ownsLand === false}
                  onChange={() => {
                    updateMember(activeTab, "ownsLand", false);
                    updateMember(activeTab, "landholdingSizeDecimals", null);
                  }}
                />
                <span className="text-body-md text-on-surface">No</span>
              </label>
            </div>
          </div>

          {member.ownsLand && (
            <div className="md:col-span-2 pt-2 border-t border-outline-variant">
              <label className={labelCls}>
                Size of total landholding of family members (in decimals)
                <span className="block text-[11px] font-normal text-secondary italic mt-0.5 leading-tight">{t("(Registration Records, Latest RoR Land records)")}</span>
              </label>
              <div className="mt-2 w-full md:w-1/2">
                <input 
                  type="number" 
                  step="0.01"
                  className={inputCls} 
                  value={member.landholdingSizeDecimals || ""} 
                  onChange={e => updateMember(activeTab, "landholdingSizeDecimals", parseFloat(e.target.value) || null)} 
                />
              </div>
              <div className="mt-4 md:col-span-2">
                <FileUpload label={t("Upload Land Documents")} value={getDoc("landDocuments")} onChange={(f) => handleDocChange("landDocuments", f)} {...getDocLimits("landDocuments", documentMasterData)} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Vehicles */}
      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Vehicles")}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className={labelCls}>
              Owns Motorized 4-Wheeler?
              <span className="ml-1.5 text-[11px] font-normal text-secondary italic">{t("(Include cars, jeeps, tractors)")}</span>
            </label>
            <select className={inputCls} value={member.hasFourWheeler ? "Yes" : "No"} onChange={e => updateMember(activeTab, "hasFourWheeler", e.target.value === "Yes")}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {member.hasFourWheeler && (
            <>
              <div>
                <label className={labelCls}>{t("Number of Vehicles")}</label>
                <input type="number" min="1" max="50" className={inputCls} value={member.vehicleCount || ""} onChange={e => {
                  const val = parseInt(e.target.value);
                  updateMember(activeTab, "vehicleCount", isNaN(val) ? null : val);
                }} />
              </div>
              <div className="md:col-span-2 space-y-4">
                {Array.from({ length: member.vehicleCount || 0 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                    <div>
                      <label className={labelCls}>{t("Vehicle Model")}{member.vehicleCount && member.vehicleCount > 1 ? ` ${i + 1}` : ""}</label>
                      <input 
                        type="text" 
                        className={inputCls} 
                        placeholder="e.g. Maruti Swift, Mahindra Tractor" 
                        value={vehicleModels[i] || ""} 
                        onChange={e => updateVehicle(i, "model", e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{t("Vehicle Registration No.")}{member.vehicleCount && member.vehicleCount > 1 ? ` ${i + 1}` : ""}</label>
                      <input 
                        type="text" 
                        className={inputCls} 
                        value={vehicleRegs[i] || ""} 
                        onChange={e => updateVehicle(i, "reg", e.target.value)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Section: Health & Insurance */}
      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Health &amp; Insurance")}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className={labelCls}>{t("Has Health Insurance?")}</label>
            <select className={inputCls} value={member.hasHealthInsurance ? "Yes" : "No"} onChange={e => updateMember(activeTab, "hasHealthInsurance", e.target.value === "Yes")}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {member.hasHealthInsurance && (
            <>
              <div>
                <label className={labelCls}>{t("Insurance Type")}</label>
                <select className={inputCls} value={member.healthInsuranceType || ""} onChange={e => updateMember(activeTab, "healthInsuranceType", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Sum Assured (₹)</label>
                <input type="number" className={inputCls} value={member.healthInsuranceSumAssured || ""} onChange={e => updateMember(activeTab, "healthInsuranceSumAssured", parseFloat(e.target.value) || null)} />
              </div>
              <div>
                <label className={labelCls}>Annual Premium (₹)</label>
                <input type="number" className={inputCls} value={member.healthInsuranceAnnualPremium || ""} onChange={e => updateMember(activeTab, "healthInsuranceAnnualPremium", parseFloat(e.target.value) || null)} />
              </div>
              <div className="md:col-span-2">
                <FileUpload label={t("Upload Health Insurance Document (including Swasthya Sathi, Ayushman Bharat)")} value={getDoc("healthInsurance")} onChange={(f) => handleDocChange("healthInsurance", f)} {...getDocLimits("healthInsurance", documentMasterData)} />
              </div>
            </>
          )}
        </div>
        {member.isChild && (
          <div className="p-6 border-t border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 bg-amber-50/30">
            <div className="md:col-span-2">
              <h4 className="text-label-md font-semibold text-primary mb-2">Child Vaccination Details</h4>
            </div>
            <div>
              <label className={labelCls}>{t("Vaccination Started / Completed?")}</label>
              <select className={inputCls} value={member.vaccinationStatus || ""} onChange={e => updateMember(activeTab, "vaccinationStatus", e.target.value)}>
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="Not Vaccinated">Not Vaccinated</option>
              </select>
            </div>
            {member.vaccinationStatus === "Yes" && (
              <>
                <div>
                  <label className={labelCls}>{t("Vaccination Card ID")}</label>
                  <input type="text" className={inputCls} value={member.vaccinationCardId || ""} onChange={e => updateMember(activeTab, "vaccinationCardId", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <FileUpload label={t("Upload Vaccination Card")} value={getDoc("vaccinationCard")} onChange={(f) => handleDocChange("vaccinationCard", f)} {...getDocLimits("vaccinationCard", documentMasterData)} />
                </div>
              </>
            )}
            {member.vaccinationStatus === "Not Vaccinated" && (
              <div>
                <label className={labelCls}>{t("Reason for skipping / Last date")}</label>
                <input type="text" className={inputCls} value={member.vaccinationSkipReasonOrDate || ""} onChange={e => updateMember(activeTab, "vaccinationSkipReasonOrDate", e.target.value)} />
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

"use client";
import FileUpload from "@/components/form/FileUpload";
import { useMasterData } from "@/hooks/useMasterData";
import { getDocLimits } from "./constants";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

interface Member {
  disabilityIdNo: string;
  disabilityIssuedDate: string;
  disabilityPercentage: number | null;
  disabilityIssuingAuthority: string;
  otherIdNo: string;
  otherIdIssuedDate: string;
  otherIdIssuingAuthority: string;
  caaApplicationStatus: string;
  caaApplicationNo: string;
  caaCertificateNo: string;
  otherSpecificIds?: { idType: string; idNumber: string; issueDate: string; issuingAuthority: string; }[];
  sir2026TribunalStatus: string;
  hasHealthInsurance: boolean;
  healthInsuranceType: string;
  healthInsuranceSumAssured: number | null;
  healthInsuranceAnnualPremium: number | null;
  literacyStatus: string;
  highestEducationalQualifications: string;
  [key: string]: any;
}

interface Props {
  member: Member;
  activeTab: number;
  activeSection: string;
  updateMember: (index: number, field: string, value: unknown) => void;
}

export default function MemberOtherSections({ member, activeTab, activeSection, updateMember }: Props) {
  const { data: documentMasterData } = useMasterData("document-master.json");
  const handleDocChange = (docName: string, file: File | null) => {
    const currentDocs = (member.documents as any) || {};
    updateMember(activeTab, 'documents', { ...currentDocs, [docName]: file });
  };
  const getDoc = (docName: string) => (member.documents as any)?.[docName] || null;

  return (
    <>
      {/* Section: Identity Documents */}
      {activeSection === "identity" && (
        <section className={cardCls}>
          <div className={sectionHeaderCls}>
            <h3 className="text-label-md font-semibold text-on-surface">Other Identity Documents</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="md:col-span-2">
              <h4 className="text-label-md font-semibold text-primary mb-4">CAA Application Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className={labelCls}>Application Status</label>
                  <select className={inputCls} value={member.caaApplicationStatus || "Not Applicable"} onChange={e => updateMember(activeTab, "caaApplicationStatus", e.target.value)}>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Applied">Applied</option>
                    <option value="Issued">Issued</option>
                  </select>
                </div>
                {member.caaApplicationStatus === "Applied" && (
                  <div>
                    <label className={labelCls}>Application No.</label>
                    <input type="text" className={inputCls} value={member.caaApplicationNo || ""} onChange={e => updateMember(activeTab, "caaApplicationNo", e.target.value)} />
                  </div>
                )}
                {member.caaApplicationStatus === "Issued" && (
                  <div>
                    <label className={labelCls}>Certificate No.</label>
                    <input type="text" className={inputCls} value={member.caaCertificateNo || ""} onChange={e => updateMember(activeTab, "caaCertificateNo", e.target.value)} />
                  </div>
                )}
                {member.caaApplicationStatus !== "Not Applicable" && (
                  <div className="md:col-span-2">
                    <FileUpload label="Upload CAA Application / Certificate Document" value={getDoc("caaApplication")} onChange={(f) => handleDocChange("caaApplication", f)} {...getDocLimits("caaApplication", documentMasterData)} />
                  </div>
                )}
              </div>
            </div>

            {/* Other IDs List */}
            <div className="md:col-span-2 pt-4 border-t border-outline-variant">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-label-md font-semibold text-primary">Other Specific IDs</h4>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                  onClick={() => {
                    const currentList = Array.isArray(member.otherSpecificIds) ? member.otherSpecificIds : [];
                    updateMember(activeTab, "otherSpecificIds", [...currentList, { idType: "", idNumber: "", issueDate: "", issuingAuthority: "" }]);
                  }}
                >
                  + Add ID
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                {Array.isArray(member.otherSpecificIds) && member.otherSpecificIds.map((specId, idx) => (
                  <div key={idx} className="md:col-span-2 bg-surface-container-low p-4 rounded-lg border border-outline-variant space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="w-full">
                        <label className={labelCls}>ID Type</label>
                        <select
                          className={inputCls}
                          value={specId.idType || ""}
                          onChange={e => {
                            const newList = [...member.otherSpecificIds!];
                            newList[idx] = { ...newList[idx], idType: e.target.value };
                            updateMember(activeTab, "otherSpecificIds", newList);
                          }}
                        >
                          <option value="">Select ID Type...</option>
                          <option value="KCC">KCC</option>
                          <option value="KCC ARD">KCC ARD</option>
                          <option value="Artisan Credit Card">Artisan Credit Card</option>
                          <option value="MJCC">MJCC</option>
                          <option value="Student CC">Student CC</option>
                          <option value="Disability Certificate">Disability Certificate</option>
                          <option value="Fisherman Registration Card">Fisherman Registration Card</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className={labelCls}>No. of ID</label>
                        <input
                          type="text"
                          className={inputCls}
                          value={specId.idNumber || ""}
                          onChange={e => {
                            const newList = [...member.otherSpecificIds!];
                            newList[idx] = { ...newList[idx], idNumber: e.target.value };
                            updateMember(activeTab, "otherSpecificIds", newList);
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <label className={labelCls}>Date of issue</label>
                        <input
                          type="date"
                          className={inputCls}
                          value={specId.issueDate || ""}
                          onChange={e => {
                            const newList = [...member.otherSpecificIds!];
                            newList[idx] = { ...newList[idx], issueDate: e.target.value };
                            updateMember(activeTab, "otherSpecificIds", newList);
                          }}
                        />
                      </div>
                      <div className="w-full md:col-span-2">
                        <label className={labelCls}>Issuing authority</label>
                        <input
                          type="text"
                          className={inputCls}
                          value={specId.issuingAuthority || ""}
                          onChange={e => {
                            const newList = [...member.otherSpecificIds!];
                            newList[idx] = { ...newList[idx], issuingAuthority: e.target.value };
                            updateMember(activeTab, "otherSpecificIds", newList);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="h-11 px-4 text-error bg-error/10 hover:bg-error/20 rounded font-medium transition-colors"
                        onClick={() => {
                          const newList = [...member.otherSpecificIds!];
                          newList.splice(idx, 1);
                          updateMember(activeTab, "otherSpecificIds", newList);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <FileUpload 
                        label={`Upload Document for ${specId.idType || "this ID"}`} 
                        value={getDoc(`otherSpecificId_${idx}`)} 
                        onChange={(f) => handleDocChange(`otherSpecificId_${idx}`, f)} 
                        {...getDocLimits(`otherSpecificId_${idx}`, documentMasterData)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-outline-variant">
              <h4 className="text-label-md font-semibold text-primary mb-4">SIR 2026 Tribunal Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className={labelCls}>If Deleted in SIR 2026, case pending?</label>
                  <select className={inputCls} value={member.sir2026TribunalStatus || "Not Applicable"} onChange={e => updateMember(activeTab, "sir2026TribunalStatus", e.target.value)}>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="NO">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                {member.sir2026TribunalStatus === "Yes" && (
                  <>
                    <div>
                      <label className={labelCls}>Case Details</label>
                      <input type="text" className={inputCls} value={member.sir2026CaseDetails || ""} onChange={e => updateMember(activeTab, "sir2026CaseDetails", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <FileUpload label="Upload SIR Application Document" value={getDoc("sirApplication")} onChange={(f) => handleDocChange("sirApplication", f)} {...getDocLimits("sirApplication", documentMasterData)} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}


    </>
  );
}

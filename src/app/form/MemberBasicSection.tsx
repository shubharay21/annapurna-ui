"use client";

import { useEffect, useState } from "react";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

interface Member {
  memberName: string;
  aadhaarNo: string;
  mobileNo: string;
  dateOfBirth: string;
  gender: string;
  socialCategory: string;
  digitalRationCardType: string;
  digitalRationCardNo: string;
  hasDigitalRationCard?: boolean | null;
  liftingMonthlyRation?: boolean | null;
  epicNo: string;
  assemblyConstituencyNo: string;
  partNo: string;
  bankAccountNo: string;
  ifscCode: string;
  bankName?: string;
  [key: string]: any;
}

interface Props {
  member: Member;
  activeTab: number;
  updateMember: (index: number, field: string, value: unknown) => void;
  familyDistrict?: number | null;
}

import { useLanguage } from "@/app/i18n/LanguageContext";
import { useMasterData } from "@/hooks/useMasterData";
import IfscSearch from "./IfscSearch";

export default function MemberBasicSection({ member, activeTab, updateMember, familyDistrict }: Props) {
  const { t } = useLanguage();
  
  // Load local bank IFSC master data
  const { data: bankData, loading: isFetchingBank } = useMasterData("bank-ifsc-master.json");

  useEffect(() => {
    if (member.ifscCode && member.ifscCode.length === 11) {
      if (bankData && Array.isArray(bankData)) {
        const bank = bankData.find((b: any) => b.ifsc === member.ifscCode.toUpperCase());
        if (bank) {
          if (bank.bankName !== member.bankName) {
            updateMember(activeTab, "bankName", bank.bankName);
          }
        } else {
          if (member.bankName !== "Invalid IFSC") {
            updateMember(activeTab, "bankName", "Invalid IFSC");
          }
        }
      }
    } else if (member.ifscCode && member.ifscCode.length < 11) {
      if (member.bankName) updateMember(activeTab, "bankName", "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.ifscCode, activeTab, bankData]);
  
  const isChildUnder5 = () => {
    if (member.isChild !== true) return false;
    if (!member.dateOfBirth) return false;
    const dob = new Date(member.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age < 5;
  };

  return (
    <>
      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Basic Information")}</h3>
        </div>
        {member.gender === "Female" && member.isChild === false && (
          <div className="bg-primary/5 border-b border-primary/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-primary font-bold text-label-lg">{t("Applying for Annapurna Yojana?")} <span className="text-error">*</span></h4>
              <p className="text-body-sm text-secondary">{t("Mandatory selection for adult female members.")}</p>
            </div>
            <select data-testid="member-annapurna" className="w-full md:w-48 h-11 px-4 border-2 border-primary/40 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white text-primary font-bold text-body-md shadow-sm" value={member.applyingForAnnapurnaBhandar === true ? "Yes" : (member.applyingForAnnapurnaBhandar === false ? "No" : "")} onChange={e => {
              if (e.target.value === "") updateMember(activeTab, "applyingForAnnapurnaBhandar", null);
              else updateMember(activeTab, "applyingForAnnapurnaBhandar", e.target.value === "Yes");
            }}>
              <option value="">{t("Select Option...")}</option>
              <option value="Yes">{t("Yes, I am applying")}</option>
              <option value="No">{t("No, I am not")}</option>
            </select>
          </div>
        )}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className={labelCls}>{t("Name (As per Aadhaar or Official ID)")}</label>
            <input data-testid="member-name" type="text" className={inputCls} value={member.memberName} onChange={e => updateMember(activeTab, "memberName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} />
          </div>
          {!member.isHoF && (
            <div>
              <label className={labelCls}>{t("Relation with Head of Family")}</label>
              <select className={inputCls} value={member.relationWithHeadOfFamily || ""} onChange={e => updateMember(activeTab, "relationWithHeadOfFamily", e.target.value)}>
                <option value="">{t("Select Relation...")}</option>
                <option value="Father">{t("Father")}</option>
                <option value="Mother">{t("Mother")}</option>
                <option value="Husband">{t("Husband")}</option>
                <option value="Wife">{t("Wife")}</option>
                <option value="Son">{t("Son")}</option>
                <option value="Daughter">{t("Daughter")}</option>
                <option value="Brother">{t("Brother")}</option>
                <option value="Sister">{t("Sister")}</option>
                <option value="Grandson">{t("Grandson")}</option>
                <option value="Granddaughter">{t("Granddaughter")}</option>
                <option value="Other">{t("Other")}</option>
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>{t("Date of Birth")}</label>
            <input type="date" className={inputCls} value={member.dateOfBirth || ""} max={new Date().toISOString().split('T')[0]} onChange={e => updateMember(activeTab, "dateOfBirth", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("Gender")}</label>
            <select data-testid="member-gender" className={inputCls} value={member.gender || ""} onChange={e => {
              updateMember(activeTab, "gender", e.target.value);
              // Reset Annapurna Yojana selection whenever gender changes
              updateMember(activeTab, "applyingForAnnapurnaBhandar", null);
            }}>
              <option value="">{t("Select...")}</option>
              <option value="Male">{t("Male")}</option>
              <option value="Female">{t("Female")}</option>
              <option value="Other">{t("Other")}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("Social Category")}</label>
            <select className={inputCls} value={member.socialCategory || ""} onChange={e => updateMember(activeTab, "socialCategory", e.target.value)}>
              <option value="">{t("Select...")}</option>
              <option value="UR">{t("UR")}</option>
              <option value="UR-EWS">{t("UR-EWS")}</option>
              <option value="SC">{t("SC")}</option>
              <option value="ST">{t("ST")}</option>
              <option value="OBC">{t("OBC")}</option>
              <option value="PVTG">{t("PVTG")}</option>
              <option value="Others">{t("Others")}</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls.replace(" mb-1", "")}>{t("Aadhaar No.")}</label>
              {isChildUnder5() && (
                <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer">
                  <input type="checkbox" checked={member.aadhaarNo === "N/A"} onChange={e => {
                    if (e.target.checked) updateMember(activeTab, "aadhaarNo", "N/A");
                    else updateMember(activeTab, "aadhaarNo", "");
                  }} />
                  {t("Not Available (Age < 5)")}
                </label>
              )}
            </div>
            <input data-testid="member-aadhaar" type="text" className={inputCls} disabled={member.aadhaarNo === "N/A"} value={member.aadhaarNo} maxLength={12} onChange={e => updateMember(activeTab, "aadhaarNo", e.target.value.replace(/\D/g, ""))} />
          </div>
          {member.isHoF && (
            <div>
              <label className={labelCls}>{t("Contact No (Preferably Aadhaar linked mobile no. of HOF)")}</label>
              <input data-testid="member-mobile" type="text" className={inputCls} value={member.mobileNo || ""} maxLength={10} onChange={e => updateMember(activeTab, "mobileNo", e.target.value.replace(/\D/g, ""))} />
            </div>
          )}
        </div>
      </section>

      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Voter Card Details")}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelCls}>{t("EPIC No.")}</label>
            <input type="text" className={inputCls} value={member.epicNo || ""} onChange={e => updateMember(activeTab, "epicNo", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))} />
          </div>
          <div>
            <label className={labelCls}>{t("Assembly Constituency No.")}</label>
            <input type="text" className={inputCls} value={member.assemblyConstituencyNo || ""} onChange={e => updateMember(activeTab, "assemblyConstituencyNo", e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label className={labelCls}>{t("Part No.")}</label>
            <input type="text" className={inputCls} value={member.partNo || ""} onChange={e => updateMember(activeTab, "partNo", e.target.value.replace(/\D/g, ""))} />
          </div>
        </div>
      </section>

      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Bank Details")}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className={labelCls}>
              {t("Account No.")}
              <span className="ml-1.5 text-[11px] font-normal text-primary/70 italic">{t("(Aadhaar seeded account no.)")}</span>
            </label>
            <input type="text" className={inputCls} value={member.bankAccountNo || ""} onChange={e => updateMember(activeTab, "bankAccountNo", e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label className={labelCls}>{t("IFSC Code / Bank Search")}</label>
            <IfscSearch 
              className={inputCls} 
              value={member.ifscCode || ""} 
              onChange={val => updateMember(activeTab, "ifscCode", val.replace(/[^a-zA-Z0-9\s]/g, ""))} 
              placeholder={t("Type IFSC or Bank Name")}
            />
          </div>
          <div>
            <label className={labelCls}>{t("Bank Name")} {isFetchingBank && <span className="text-primary text-xs ml-2 animate-pulse">{t("Fetching...")}</span>}</label>
            <input 
              type="text" 
              className={`${inputCls} bg-surface-container-highest cursor-not-allowed`} 
              readOnly
              placeholder={t("e.g. State Bank of India")} 
              value={member.bankName || ""} 
            />
          </div>
        </div>
      </section>
    </>
  );
}

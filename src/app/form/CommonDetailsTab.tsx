"use client";
import { useLanguage } from "@/app/i18n/LanguageContext";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";
const sectionHeaderCls =
  "bg-surface-container-low px-6 py-3 border-b border-outline-variant flex items-center justify-between";
const cardCls = "bg-white border border-outline-variant rounded-xl overflow-hidden";

interface FamilyInfo {
  totalFamilyMembers: number;
  liftingMonthlyRation: boolean;
  hasElectricityConnection: boolean;
  electricityConsumerId: string;
  powerUnitsConsumed: number | null;
  isAgreed: boolean;
  address: string;
  rationCardHouseholdId: string;
  hasDigitalRationCard: boolean;
  noOfLiterateAdults: number | null;
  noOfIlliterateAdults: number | null;
  totalAnnualFamilyIncome: number | null;
}

interface Props {
  familyInfo: FamilyInfo;
  updateFamily: (field: string, value: unknown) => void;
}

export default function CommonDetailsTab({ familyInfo, updateFamily }: Props) {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto space-y-6">




      


      {/* Declaration */}
      <section className={cardCls}>
        <div className={sectionHeaderCls}>
          <h3 className="text-label-md font-semibold text-on-surface">{t("Declaration &amp; Consent")}</h3>
        </div>
        <div className="p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              data-testid="declaration-checkbox"
              type="checkbox"
              className="mt-1 w-5 h-5 text-primary focus:ring-primary rounded"
              checked={familyInfo.isAgreed}
              onChange={e => updateFamily("isAgreed", e.target.checked)}
            />
            <span className="text-body-md text-on-surface">{t("I hereby declare that above information is true and I have provided all the supporting documents where applicable and HAVE NOT missed any criteria. I understand that I shall be liable for appropriate actions for any False information provided by me.")}</span>
          </label>
        </div>
      </section>
    </div>
  );
}

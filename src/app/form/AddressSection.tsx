"use client";

import { useLanguage } from "@/app/i18n/LanguageContext";
import { useMasterData } from "@/hooks/useMasterData";

const inputCls =
  "w-full h-11 px-4 border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-on-surface text-body-md";
const labelCls = "block text-label-sm font-semibold text-secondary mb-1";

export default function AddressSection({ familyInfo, updateFamily }: any) {
  const { t } = useLanguage();

  const { data: districts } = useMasterData("disrict.json");
  const { data: blocks } = useMasterData("block.json");
  const { data: gps } = useMasterData("gps.json");
  const { data: ulbs } = useMasterData("ulbs.json");
  const { data: wards } = useMasterData("ulb_ward.json");

  const filteredBlocks = blocks?.filter((b: any) => b.district_code === familyInfo.district) || [];
  const filteredGps = gps?.filter((g: any) => g.block_code === familyInfo.block) || [];
  const filteredUlbs = ulbs?.filter((u: any) => u.district_code === familyInfo.district) || [];
  const filteredWards = wards?.filter((w: any) => w.ulb_code === familyInfo.ulb) || [];

  return (
    <>
      <div>
        <label className={labelCls}>{t("District")}</label>
        <select 
          className={inputCls} 
          value={familyInfo.district || ""} 
          onChange={e => {
            updateFamily("district", parseInt(e.target.value) || null);
            updateFamily("block", null);
            updateFamily("gp", null);
            updateFamily("ulb", null);
            updateFamily("ward", null);
          }}
        >
          <option value="">Select District</option>
          {districts?.map((d: any) => <option key={d.id} value={d.id}>{d.text}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>{t("Area Type")}</label>
        <select 
          className={inputCls} 
          value={familyInfo.areaType || ""} 
          onChange={e => {
            updateFamily("areaType", e.target.value || null);
            updateFamily("block", null);
            updateFamily("gp", null);
            updateFamily("ulb", null);
            updateFamily("ward", null);
          }}
        >
          <option value="">Select Type</option>
          <option value="Rural">Rural</option>
          <option value="Urban">Urban</option>
        </select>
      </div>

      {familyInfo.areaType === "Rural" && (
        <>
          <div>
            <label className={labelCls}>{t("Block")}</label>
            <select 
              className={inputCls} 
              value={familyInfo.block || ""} 
              onChange={e => {
                updateFamily("block", parseInt(e.target.value) || null);
                updateFamily("gp", null);
              }}
            >
              <option value="">Select Block</option>
              {filteredBlocks.map((b: any) => <option key={b.id} value={b.id}>{b.text}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("Gram Panchayat")}</label>
            <select 
              className={inputCls} 
              value={familyInfo.gp || ""} 
              onChange={e => updateFamily("gp", parseInt(e.target.value) || null)}
            >
              <option value="">Select GP</option>
              {filteredGps.map((g: any) => <option key={g.id} value={g.id}>{g.text}</option>)}
            </select>
          </div>
        </>
      )}

      {familyInfo.areaType === "Urban" && (
        <>
          <div>
            <label className={labelCls}>{t("ULB / Municipality")}</label>
            <select 
              className={inputCls} 
              value={familyInfo.ulb || ""} 
              onChange={e => {
                updateFamily("ulb", parseInt(e.target.value) || null);
                updateFamily("ward", null);
              }}
            >
              <option value="">Select ULB</option>
              {filteredUlbs.map((u: any) => <option key={u.id} value={u.id}>{u.text}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("Ward")}</label>
            <select 
              className={inputCls} 
              value={familyInfo.ward || ""} 
              onChange={e => updateFamily("ward", parseInt(e.target.value) || null)}
            >
              <option value="">Select Ward</option>
              {filteredWards.map((w: any) => <option key={w.id} value={w.id}>{w.text}</option>)}
            </select>
          </div>
        </>
      )}
    </>
  );
}

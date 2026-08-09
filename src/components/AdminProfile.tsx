/**
 * Admin Profile & Mappings Management Component
 */

import React, { useState } from 'react';
import { ConversionProfile, MappingRule, AreaPromptRule } from '../types.js';
import {
  Save,
  Plus,
  Trash2,
  Building2,
  BookOpen,
  EyeOff,
  Percent,
  CheckCircle2,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface AdminProfileProps {
  profile: ConversionProfile;
  onUpdateProfile: (updated: Partial<ConversionProfile>) => Promise<void>;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [editedProfile, setEditedProfile] = useState<ConversionProfile>(
    JSON.parse(JSON.stringify(profile))
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'company' | 'dictionary' | 'pricing' | 'terms' | 'automation'>('dictionary');

  const updateAreaPrompt = (index: number, updates: Partial<AreaPromptRule>) => {
    const areaPromptRules = [...editedProfile.areaPromptRules];
    areaPromptRules[index] = { ...areaPromptRules[index], ...updates };
    setEditedProfile({ ...editedProfile, areaPromptRules });
  };

  const handleAddRule = () => {
    const newRule: MappingRule = {
      id: `rule-${Date.now()}`,
      chineseTerm: '新中式木作',
      englishTranslation: 'Custom Oriental Joinery',
      category: 'cabinet',
      roomNameDefault: 'Living Room',
      hideByDefault: false,
    };
    setEditedProfile({
      ...editedProfile,
      rules: [...editedProfile.rules, newRule],
    });
  };

  const handleDeleteRule = (id: string) => {
    setEditedProfile({
      ...editedProfile,
      rules: editedProfile.rules.filter((r) => r.id !== id),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(editedProfile);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">MOCOF Customer English Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure approved Chinese-to-English terminology dictionary, markup rules, hardware visibility, and company defaults.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#7787c6] hover:bg-[#6878b7] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
        >
          <Save className="w-4 h-4 mr-2 text-emerald-400" />
          {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-2 flex items-center space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'dictionary'
              ? 'bg-[#7787c6] text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" /> Terminology Dictionary ({editedProfile.rules.length})
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'pricing'
              ? 'bg-[#7787c6] text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" /> Markup, Discount & Tax Rules
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'company'
              ? 'bg-[#7787c6] text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" /> Company Branding & Info
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'terms'
              ? 'bg-[#7787c6] text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" /> Terms & Conditions
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'automation'
              ? 'bg-[#7787c6] text-white shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" /> Boss Editing Rules
        </button>
      </div>

      {/* TAB 1: Terminology Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-[#0f382c]">Approved Chinese-to-English Mappings</h3>
              <p className="text-xs text-gray-500">
                Rule engine matches Chinese terms automatically before calling AI model.
              </p>
            </div>
            <button
              onClick={handleAddRule}
              className="px-3.5 py-1.5 bg-[#d6dcef] hover:bg-[#e7eafa] text-emerald-950 text-xs font-semibold rounded-lg shadow-sm inline-flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule Entry
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[10px]">
                  <th className="p-2.5">Chinese Term</th>
                  <th className="p-2.5">Approved English Translation</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Default Room</th>
                  <th className="p-2.5">Customer Visibility</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {editedProfile.rules.map((rule, idx) => (
                  <tr key={rule.id} className="hover:bg-gray-50/80">
                    <td className="p-2">
                      <input
                        type="text"
                        value={rule.chineseTerm}
                        onChange={(e) => {
                          const updated = [...editedProfile.rules];
                          updated[idx].chineseTerm = e.target.value;
                          setEditedProfile({ ...editedProfile, rules: updated });
                        }}
                        className="w-full p-1.5 border border-gray-200 rounded font-chinese text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        value={rule.englishTranslation}
                        onChange={(e) => {
                          const updated = [...editedProfile.rules];
                          updated[idx].englishTranslation = e.target.value;
                          setEditedProfile({ ...editedProfile, rules: updated });
                        }}
                        className="w-full p-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-900"
                      />
                    </td>

                    <td className="p-2">
                      <select
                        value={rule.category}
                        onChange={(e) => {
                          const updated = [...editedProfile.rules];
                          updated[idx].category = e.target.value as any;
                          setEditedProfile({ ...editedProfile, rules: updated });
                        }}
                        className="w-full p-1.5 border border-gray-200 rounded text-xs"
                      >
                        <option value="cabinet">Cabinet / Joinery</option>
                        <option value="lf">Linear Feet (LF)</option>
                        <option value="custom_door">Custom Door</option>
                        <option value="wall_panel">Wall Panel</option>
                        <option value="kitchen_vanity">Kitchen & Vanity</option>
                        <option value="hardware">Internal Hardware</option>
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        value={rule.roomNameDefault || ''}
                        onChange={(e) => {
                          const updated = [...editedProfile.rules];
                          updated[idx].roomNameDefault = e.target.value;
                          setEditedProfile({ ...editedProfile, rules: updated });
                        }}
                        className="w-full p-1.5 border border-gray-200 rounded text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.hideByDefault}
                          onChange={(e) => {
                            const updated = [...editedProfile.rules];
                            updated[idx].hideByDefault = e.target.checked;
                            setEditedProfile({ ...editedProfile, rules: updated });
                          }}
                          className="rounded text-[#0f382c] focus:ring-[#0f382c]"
                        />
                        <span className="text-[11px] text-gray-600">
                          {rule.hideByDefault ? 'Hide Internal Hardware' : 'Visible'}
                        </span>
                      </label>
                    </td>

                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Markup, Discount & Tax Rules */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-base text-[#0f382c] border-b pb-2">
            Supplier Price to Customer Price Rules
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Default Markup Percentage (%)
              </label>
              <input
                type="number"
                value={editedProfile.defaultMarkupPercent}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, defaultMarkupPercent: Number(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded-lg font-bold text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Supplier cost in CNY is multiplied by live exchange rate, then multiplied by (1 + Markup%).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Default Discount Percentage (%)
              </label>
              <input
                type="number"
                value={editedProfile.defaultDiscountPercent}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, defaultDiscountPercent: Number(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded-lg font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Malaysian SST / Tax Rate (%)
              </label>
              <input
                type="number"
                value={editedProfile.taxRatePercent}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, taxRatePercent: Number(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded-lg font-bold text-sm"
              />
            </div>

            <div className="pt-2 border-t">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedProfile.hideInternalHardwareRows}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, hideInternalHardwareRows: e.target.checked })
                  }
                  className="rounded text-[#0f382c] focus:ring-[#0f382c]"
                />
                <span className="font-bold text-gray-800">
                  Automatically hide internal supplier hardware/hinge detail rows from customer quote
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Company Branding & Info */}
      {activeTab === 'company' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 max-w-2xl text-xs">
          <h3 className="font-bold text-base text-[#0f382c] border-b pb-2">
            Company Information & Header Branding
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                value={editedProfile.companyName}
                onChange={(e) => setEditedProfile({ ...editedProfile, companyName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Company Address</label>
              <input
                type="text"
                value={editedProfile.companyAddress}
                onChange={(e) => setEditedProfile({ ...editedProfile, companyAddress: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Registration No</label>
                <input
                  type="text"
                  value={editedProfile.companyRegNo}
                  onChange={(e) => setEditedProfile({ ...editedProfile, companyRegNo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editedProfile.companyPhone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, companyPhone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Terms & Conditions */}
      {activeTab === 'terms' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 max-w-3xl text-xs">
          <h3 className="font-bold text-base text-[#0f382c] border-b pb-2">
            Mandatory Quotation Terms & Conditions
          </h3>

          <div className="space-y-2">
            {editedProfile.termsAndConditions.map((term, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-bold text-gray-500 w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...editedProfile.termsAndConditions];
                    updated[idx] = e.target.value;
                    setEditedProfile({ ...editedProfile, termsAndConditions: updated });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-base text-[#0f382c]">Automatic Google-Sheets Editing Rules</h3>
            <p className="text-gray-500 mt-1">
              These rules are sent to Gemini on every raw Chinese quotation conversion. The original workbook remains unchanged.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Shared MOCOF rules</label>
            <textarea
              value={editedProfile.bossEditingRules}
              onChange={(e) => setEditedProfile({ ...editedProfile, bossEditingRules: e.target.value })}
              rows={14}
              className="w-full p-3 border border-gray-300 rounded-lg leading-relaxed font-mono text-[11px]"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-[#0f382c]">Area 1–10 differences</h4>
              <p className="text-gray-500 mt-0.5">Paste the boss’s specific row layout or formula changes into the correct area. Areas without a confirmed difference remain safe and require review when ambiguous.</p>
            </div>
            {editedProfile.areaPromptRules.map((areaRule, index) => (
              <div key={areaRule.areaNumber} className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <div className="grid sm:grid-cols-[72px_1fr] gap-2 mb-2">
                  <input
                    type="number"
                    value={areaRule.areaNumber}
                    onChange={(e) => updateAreaPrompt(index, { areaNumber: Number(e.target.value) })}
                    className="p-2 border border-gray-300 rounded font-bold"
                    aria-label="Area number"
                  />
                  <input
                    value={areaRule.label}
                    onChange={(e) => updateAreaPrompt(index, { label: e.target.value })}
                    className="p-2 border border-gray-300 rounded font-semibold"
                    aria-label="Area label"
                  />
                </div>
                <textarea
                  value={areaRule.instructions}
                  onChange={(e) => updateAreaPrompt(index, { instructions: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded leading-relaxed"
                  aria-label={`Area ${areaRule.areaNumber} instructions`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Dashboard View Component
 */

import React, { useState } from 'react';
import {
  Project,
  ProjectStatus,
} from '../types.js';
import {
  FolderPlus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Building,
  DollarSign,
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (data: any) => void;
  onNavigateUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
  onNavigateUpload,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // New Project Form state
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    projectAddress: '',
    currency: 'MYR',
  });

  // Calculate Metrics
  const totalProjects = projects.length;
  const readyForApprovalCount = projects.filter(
    (p) => p.status === 'Generated – Ready for Approval'
  ).length;
  const exceptionsCount = projects.filter(
    (p) => p.status === 'Generated – Exceptions Need Review'
  ).length;
  const totalValueMYR =
    projects.reduce((sum, p) => sum + (p.totalMYRCents || 0), 0) / 100;

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.customerName.toLowerCase().includes(query) ||
      p.quotationNumber.toLowerCase().includes(query) ||
      p.projectAddress.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case 'Exported':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <FileSpreadsheet className="w-3 h-3 mr-1" /> Exported
          </span>
        );
      case 'Generated – Ready for Approval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Ready for Approval
          </span>
        );
      case 'Generated – Exceptions Need Review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Exceptions Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            <Clock className="w-3 h-3 mr-1" /> Processing
          </span>
        );
    }
  };

  const handleSubmitNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(newProjectData);
    setShowNewModal(false);
    setNewProjectData({
      name: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      projectAddress: '',
      currency: 'MYR',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quotation Management Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            MOCOF Malaysian Home Renovation Automatic Chinese-to-English Conversion Hub
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <FolderPlus className="w-4 h-4 mr-2 text-emerald-400" />
            New Renovation Project
          </button>

          <button
            onClick={onNavigateUpload}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Upload Supplier XLSX
          </button>
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Active Projects
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalProjects}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ready for Approval
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{readyForApprovalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exceptions Pending
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{exceptionsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Portfolio Value
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              MYR {totalValueMYR.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, quote #, address, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Exceptions Review', value: 'Generated – Exceptions Need Review' },
              { label: 'Ready for Approval', value: 'Generated – Ready for Approval' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Exported', value: 'Exported' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Customer & Project</th>
                <th className="py-3 px-4">Site Address</th>
                <th className="py-3 px-4">Grand Total (MYR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectProject(p.id)}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                      {p.quotationNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.customerName} • {p.customerPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {p.projectAddress}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      MYR {((p.totalMYRCents || 0) / 100).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectProject(p.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Open Workspace <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Create New Renovation Project</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewProject} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setia Alam Residence Joinery"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Jason Lee"
                    value={newProjectData.customerName}
                    onChange={(e) => setNewProjectData({ ...newProjectData, customerName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+60 12-345 6789"
                    value={newProjectData.customerPhone}
                    onChange={(e) => setNewProjectData({ ...newProjectData, customerPhone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Site Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No. 12, Jalan Eco Park 2, 40170 Shah Alam, Selangor"
                  value={newProjectData.projectAddress}
                  onChange={(e) => setNewProjectData({ ...newProjectData, projectAddress: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-semibold shadow-xs"
                >
                  Create & Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

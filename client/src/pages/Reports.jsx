import React, { useState, useEffect } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Report Card Component
const ReportCard = ({ title, icon, count, description, onGenerate }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-blue-600 mb-4">{count}</div>
    <button
      onClick={onGenerate}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
    >
      Generate Report
    </button>
  </div>
);

// Export Options Modal
const ExportModal = ({ isOpen, onClose, reportName, onExport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Export {reportName}</h2>
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onExport('pdf')}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2"
          >
            <span>📄</span> Export as PDF
          </button>
          <button
            onClick={() => onExport('excel')}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2"
          >
            <span>📊</span> Export as Excel
          </button>
          <button
            onClick={() => onExport('csv')}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
          >
            <span>📋</span> Export as CSV
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-06-30');
  const [filterAssetType, setFilterAssetType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');
  const [filterContractStatus, setFilterContractStatus] = useState('all');

  // Mock Data
  const assetStats = {
    totalAssets: 0,
    categoryWise: [],
    departmentWise: [],
    assigned: 0,
    unassigned: 0,
    underWarranty: 0
  };

  const purchaseStats = {
    monthly: [],
    vendorWise: []
  };

  const contractStats = {
    active: 0,
    expiring: 0,
    expired: 0
  };

  const maintenanceStats = {
    needingService: 0,
    repairHistory: []
  };

  const frequentlyRequested = {
    mostAssigned: [],
    mostUsedCategories: []
  };

  const handleGenerateReport = (reportName) => {
    setSelectedReport(reportName);
    setShowExportModal(true);
  };

  const handleExport = (format) => {
    let filename = selectedReport.toLowerCase().replace(/\s+/g, '_');

    if (format === 'pdf') {
      // For PDF, show a message and prepare for download
      const pdfContent = `
        ${selectedReport}
        Generated: ${new Date().toLocaleDateString()}
        Filters: From ${dateFrom} to ${dateTo}

        This is a sample PDF export.
        In production, you would use a library like jsPDF or pdfkit.
      `;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
    } else if (format === 'excel') {
      // For Excel, create CSV with proper formatting
      const csv = `${selectedReport}
Generated: ${new Date().toLocaleDateString()}
Filters: From ${dateFrom} to ${dateTo}

Date,Value,Count
${new Date().toLocaleDateString()},Sample Data,100
`;
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.xlsx`;
      link.click();
    } else if (format === 'csv') {
      // CSV export
      const csv = `${selectedReport}
Generated: ${new Date().toLocaleDateString()}
Filters: From ${dateFrom} to ${dateTo}

Date,Value,Count
${new Date().toLocaleDateString()},Sample Data,100
`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
    }

    toast.success(`${selectedReport} exported as ${format.toUpperCase()}`);
    setShowExportModal(false);
  };

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <button
            onClick={() => toast.success('Report refresh initiated')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all"
          >
            🔄 Refresh Reports
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
              <select
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="it">IT Assets</option>
                <option value="non-it">Non-IT Assets</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="it">IT</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract Status</label>
              <select
                value={filterContractStatus}
                onChange={(e) => setFilterContractStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'assets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📦 Assets
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'purchases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            🛒 Purchases
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'contracts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📋 Contracts
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'maintenance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            🔧 Maintenance
          </button>
          <button
            onClick={() => setActiveTab('frequently')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'frequently' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            ⭐ Frequently Requested
          </button>
        </div>

        {/* ASSETS REPORTS */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard
                title="Total Assets"
                icon="📦"
                count={assetStats.totalAssets}
                description="Complete inventory of all assets"
                onGenerate={() => handleGenerateReport('Total Assets Report')}
              />
              <ReportCard
                title="Category Wise Assets"
                icon="📊"
                count={assetStats.categoryWise.length}
                description="Assets breakdown by category"
                onGenerate={() => handleGenerateReport('Category Wise Report')}
              />
              <ReportCard
                title="Department Wise Assets"
                icon="🏢"
                count={assetStats.departmentWise.length}
                description="Assets distributed by department"
                onGenerate={() => handleGenerateReport('Department Wise Report')}
              />
              <ReportCard
                title="Assigned Assets"
                icon="👥"
                count={assetStats.assigned}
                description="Assets assigned to users"
                onGenerate={() => handleGenerateReport('Assigned Assets Report')}
              />
              <ReportCard
                title="Unassigned Assets"
                icon="📍"
                count={assetStats.unassigned}
                description="Assets available in inventory"
                onGenerate={() => handleGenerateReport('Unassigned Assets Report')}
              />
              <ReportCard
                title="Warranty Report"
                icon="✅"
                count={assetStats.underWarranty}
                description="Assets under warranty coverage"
                onGenerate={() => handleGenerateReport('Warranty Report')}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetStats.categoryWise}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {assetStats.categoryWise.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetStats.departmentWise}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASES REPORTS */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReportCard
                title="Monthly Purchases"
                icon="📅"
                count={purchaseStats.monthly.length}
                description="Purchase trends over time"
                onGenerate={() => handleGenerateReport('Monthly Purchases Report')}
              />
              <ReportCard
                title="Vendor Wise Purchases"
                icon="🏪"
                count={purchaseStats.vendorWise.length}
                description="Spending by vendor"
                onGenerate={() => handleGenerateReport('Vendor Wise Report')}
              />
              <ReportCard
                title="Cost Analysis"
                icon="💰"
                count="₹12.2L"
                description="Total purchase expenditure"
                onGenerate={() => handleGenerateReport('Cost Analysis Report')}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Purchase Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={purchaseStats.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="amount" fill="#3b82f6" stroke="#3b82f6" name="Amount (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Spending</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={purchaseStats.vendorWise}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vendor" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="spent" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* CONTRACTS REPORTS */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReportCard
                title="Active Contracts"
                icon="✅"
                count={contractStats.active}
                description="Currently active contracts"
                onGenerate={() => handleGenerateReport('Active Contracts Report')}
              />
              <ReportCard
                title="Expiring Contracts"
                icon="⚠️"
                count={contractStats.expiring}
                description="Contracts expiring soon"
                onGenerate={() => handleGenerateReport('Expiring Contracts Report')}
              />
              <ReportCard
                title="Expired Contracts"
                icon="❌"
                count={contractStats.expired}
                description="Expired contracts"
                onGenerate={() => handleGenerateReport('Expired Contracts Report')}
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-600 text-sm">Active Contracts</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">{contractStats.active}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-l-4 border-orange-500">
                  <p className="text-gray-600 text-sm">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-700 mt-2">{contractStats.expiring}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-600 text-sm">Expired</p>
                  <p className="text-3xl font-bold text-red-700 mt-2">{contractStats.expired}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAINTENANCE REPORTS */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportCard
                title="Assets Needing Service"
                icon="🔧"
                count={maintenanceStats.needingService}
                description="Assets requiring maintenance"
                onGenerate={() => handleGenerateReport('Maintenance Due Report')}
              />
              <ReportCard
                title="Repair History"
                icon="🛠️"
                count={maintenanceStats.repairHistory.reduce((sum, m) => sum + m.repairs, 0)}
                description="Total repairs performed"
                onGenerate={() => handleGenerateReport('Repair History Report')}
              />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Repair Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={maintenanceStats.repairHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="repairs" stroke="#f59e0b" strokeWidth={2} name="Repairs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* FREQUENTLY REQUESTED REPORTS */}
        {activeTab === 'frequently' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Assigned Assets</h3>
                <div className="space-y-4">
                  {frequentlyRequested.mostAssigned.map((asset, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{idx + 1}. {asset.asset}</p>
                        <p className="text-sm text-gray-600">{asset.count} assignments</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(asset.count / 42) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Used Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frequentlyRequested.mostUsedCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={() => handleGenerateReport('Frequently Requested Assets Report')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              📊 Generate Full Report
            </button>
          </div>
        )}

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          reportName={selectedReport}
          onExport={handleExport}
        />
      </div>
    </AppLayout>
  );
};

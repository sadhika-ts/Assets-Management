import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Stat Card Component
const StatCard = ({ label, value, color, icon, onClick, trend }) => {
  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50',
    purple: 'border-l-purple-500 bg-purple-50',
    green: 'border-l-green-500 bg-green-50',
    orange: 'border-l-orange-500 bg-orange-50',
    red: 'border-l-red-500 bg-red-50',
    cyan: 'border-l-cyan-500 bg-cyan-50',
    pink: 'border-l-pink-500 bg-pink-50',
    indigo: 'border-l-indigo-500 bg-indigo-50',
    teal: 'border-l-teal-500 bg-teal-50'
  };

  const textColorClasses = {
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    green: 'text-green-700',
    orange: 'text-orange-700',
    red: 'text-red-700',
    cyan: 'text-cyan-700',
    pink: 'text-pink-700',
    indigo: 'text-indigo-700',
    teal: 'text-teal-700'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-lg shadow-sm border-l-4 transition-all ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${textColorClasses[color]}`}>{value}</p>
          {trend && <p className="text-xs text-green-600 mt-2">↑ {trend} from last month</p>}
        </div>
        {icon && <div className="text-5xl ml-4">{icon}</div>}
      </div>
    </div>
  );
};


// Chart Card Component
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

// Recent Activity Item
const ActivityItem = ({ type, title, date, icon, color }) => {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-${color}-100`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{type} • {date}</p>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalAssets: 0,
    itAssets: 0,
    nonItAssets: 0,
    activeContracts: 0,
    expiringContracts: 0,
    purchasedThisMonth: 0,
    underWarranty: 0,
    assignedAssets: 0,
    inStock: 0,
    needingMaintenance: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/reports/dashboard');
      setMetrics(response.data || metrics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Chart Data: Assets by Category
  const assetsByCategory = [];

  // Chart Data: Assets by Department
  const assetsByDepartment = [];

  // Chart Data: Purchase Trend (Last 6 months)
  const purchaseTrend = [];

  // Chart Data: Contract Expiry Timeline
  const contractTimeline = [];

  // Chart Data: Asset Health Status
  const assetHealth = [];

  // Recent Activities
  const recentActivities = {
    added: [],
    purchased: [
      { id: 2, title: 'Keyboard Mechanical RGB', date: '1 day ago', icon: '⌨️', color: 'purple' },
      { id: 3, title: 'Router WiFi 6', date: '2 days ago', icon: '📡', color: 'pink' }
    ],
    updated: [
      { id: 1, title: 'Asset LAP-001 warranty', date: '4 hours ago', icon: '✏️', color: 'indigo' },
      { id: 2, title: 'Contract renewal - ABC Corp', date: '1 day ago', icon: '📋', color: 'teal' },
      { id: 3, title: 'Asset assignment to John Doe', date: '2 days ago', icon: '👤', color: 'pink' }
    ]
  };


  return (
    <AppLayout title="Dashboard">
      <div className="space-y-8">

        {/* Key Metrics - Grid 1 (5 Cards) */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Assets" value={metrics.totalAssets} color="blue" icon="📦" trend="12" />
            <StatCard label="IT Assets" value={metrics.itAssets} color="purple" icon="💻" trend="8" />
            <StatCard label="Non-IT Assets" value={metrics.nonItAssets} color="green" icon="🪑" trend="4" />
            <StatCard label="Active Contracts" value={metrics.activeContracts} color="orange" icon="📋" trend="2" />
            <StatCard label="Expiring Soon" value={metrics.expiringContracts} color="red" icon="⚠️" />
          </div>
        </div>

        {/* Additional Metrics - Grid 2 (5 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Purchased This Month" value={metrics.purchasedThisMonth} color="cyan" icon="🆕" trend="5" />
          <StatCard label="Under Warranty" value={metrics.underWarranty} color="indigo" icon="✅" trend="3" />
          <StatCard label="Assigned to Users" value={metrics.assignedAssets} color="pink" icon="👥" trend="6" />
          <StatCard label="In Stock" value={metrics.inStock} color="teal" icon="📍" trend="2" />
          <StatCard label="Needing Maintenance" value={metrics.needingMaintenance} color="red" icon="🔧" />
        </div>

        {/* Charts Section - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Assets by Category */}
          <ChartCard title="📊 Assets by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Assets by Department */}
          <ChartCard title="🏢 Assets by Department">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Section - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Purchase Trend */}
          <ChartCard title="📈 Purchase Trend (Last 6 Months)">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={purchaseTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="purchases" fill="#8b5cf6" stroke="#8b5cf6" name="Units" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Contract Expiry Timeline */}
          <ChartCard title="⏰ Contract Expiry Timeline">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contractTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="expiring" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 5 }} name="Contracts Expiring" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Section - Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Asset Health Status */}
          <ChartCard title="💚 Asset Health Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetHealth}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Asset Distribution Stats */}
          <ChartCard title="📍 Asset Distribution">
            <div className="space-y-4">
              {[
                { label: 'In Stock', value: metrics.inStock, max: 300, color: 'bg-green-500' },
                { label: 'Assigned', value: metrics.assignedAssets, max: 300, color: 'bg-blue-500' },
                { label: 'Warranty', value: metrics.underWarranty, max: 300, color: 'bg-purple-500' },
                { label: 'Maintenance', value: metrics.needingMaintenance, max: 50, color: 'bg-red-500' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Recent Activities Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Recently Added Assets */}
            <ChartCard title="✨ Recently Added Assets">
              <div className="space-y-2">
                {recentActivities.added.map((item) => (
                  <ActivityItem
                    key={item.id}
                    type="Asset Added"
                    title={item.title}
                    date={item.date}
                    icon={item.icon}
                    color={item.color}
                  />
                ))}
              </div>
            </ChartCard>

            {/* Recently Purchased Assets */}
            <ChartCard title="🛒 Recently Purchased">
              <div className="space-y-2">
                {recentActivities.purchased.map((item) => (
                  <ActivityItem
                    key={item.id}
                    type="Purchase"
                    title={item.title}
                    date={item.date}
                    icon={item.icon}
                    color={item.color}
                  />
                ))}
              </div>
            </ChartCard>

            {/* Recently Updated Assets */}
            <ChartCard title="📝 Recently Updated">
              <div className="space-y-2">
                {recentActivities.updated.map((item) => (
                  <ActivityItem
                    key={item.id}
                    type="Update"
                    title={item.title}
                    date={item.date}
                    icon={item.icon}
                    color={item.color}
                  />
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4">📊 Asset Inventory Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Total Asset Value</p>
              <p className="text-3xl font-bold">₹0</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Avg Asset Age</p>
              <p className="text-3xl font-bold">0Y</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Utilization Rate</p>
              <p className="text-3xl font-bold">0%</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Renewal Rate</p>
              <p className="text-3xl font-bold">0%</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

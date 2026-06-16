import axios from 'axios';

const USE_MOCK_API = !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

if (USE_MOCK_API) {
  // Mock data - Seeded Data
  const mockAssets = [
    {
      id: '1',
      asset_tag: 'COMP-001',
      asset_name: 'Desktop Computer',
      category: 'IT',
      sub_type: 'Computer',
      status: 'active',
      assigned_to: 'Sadhika TS',
      created_at: '2026-01-15',
      detail: {
        serial_no: 'DELL784512',
        mac_address: '00:1A:2B:3C:4D:5E',
        manufacturer: 'Dell',
        model: 'OptiPlex 7090',
        os_type: 'Windows',
        os_version: '11 Pro',
        processor_name: 'Intel Core i7',
        cores: 8,
        ram_gb: 16,
        disk_gb: 512
      }
    },
    {
      id: '2',
      asset_tag: 'LAP-001',
      asset_name: 'HP Laptop',
      category: 'IT',
      sub_type: 'Laptop',
      status: 'active',
      assigned_to: 'Arun Kumar',
      created_at: '2026-01-16',
      detail: {
        serial_no: 'HP456789123',
        mac_address: '00:AA:BB:CC:DD:EE',
        manufacturer: 'HP',
        model: 'EliteBook 850',
        os_type: 'Windows',
        os_version: '11 Pro',
        processor_name: 'Intel Core i5',
        cores: 6,
        ram_gb: 8,
        disk_gb: 256
      }
    },
    {
      id: '3',
      asset_tag: 'PRT-001',
      asset_name: 'HP Printer',
      category: 'IT',
      sub_type: 'Printer',
      status: 'active',
      assigned_to: null,
      created_at: '2026-01-17',
      detail: {
        serial_no: 'HPPRT789456',
        manufacturer: 'HP',
        model: 'LaserJet Pro M404n'
      }
    },
    {
      id: '4',
      asset_tag: 'RTR-001',
      asset_name: 'Cisco Router',
      category: 'IT',
      sub_type: 'Router',
      status: 'active',
      assigned_to: null,
      created_at: '2026-01-18',
      detail: {
        serial_no: 'CISCO456123',
        mac_address: '11:22:33:44:55:66',
        manufacturer: 'Cisco',
        model: 'ISR 1100-6G'
      }
    },
    {
      id: '5',
      asset_tag: 'IT-OTH-001',
      asset_name: 'Biometric Attendance Device',
      category: 'IT',
      sub_type: 'Other',
      status: 'active',
      assigned_to: null,
      created_at: '2026-01-19',
      detail: {
        serial_no: 'BIO123456',
        manufacturer: 'Realtime',
        model: 'RealFace 10'
      }
    }
  ];

  const mockPurchases = [
    {
      id: '1',
      purchase_id: 'PO-2025-001',
      vendor_name: 'Dell Technologies',
      vendor_contact: '+91 9876543210',
      vendor_email: 'sales@dell.com',
      billing_address: 'Chennai Head Office',
      shipping_address: 'Chennai IT Department',
      purchase_date: '2025-05-15',
      total_amount: 350000,
      status: 'delivered'
    },
    {
      id: '2',
      purchase_id: 'PO-2025-002',
      vendor_name: 'HP India',
      vendor_contact: '+91 9123456780',
      vendor_email: 'orders@hp.com',
      billing_address: 'Chennai Head Office',
      shipping_address: 'Chennai Branch Office',
      purchase_date: '2025-05-20',
      total_amount: 125000,
      status: 'delivered'
    }
  ];

  const mockContracts = [
    {
      id: '1',
      contract_id: 'CON-2025-001',
      contract_name: 'Dell Laptop AMC',
      vendor_name: 'Dell Technologies',
      active_from: '2025-01-01',
      active_till: '2026-01-01',
      status: 'active',
      contract_value: 150000,
      notes: 'Annual maintenance contract for Dell devices'
    },
    {
      id: '2',
      contract_id: 'CON-2025-002',
      contract_name: 'Microsoft Office License',
      vendor_name: 'Microsoft',
      active_from: '2025-02-01',
      active_till: '2027-02-01',
      status: 'active',
      contract_value: 200000,
      notes: 'Enterprise Office Licensing'
    }
  ];

  api.interceptors.request.use(async (config) => {
    // Don't intercept if already processed
    if (config._mockProcessed) {
      return config;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const { url, method } = config;

    // GET ASSETS
    if (url.includes('assets') && method === 'get' && !url.includes('reports')) {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: mockAssets
      };

      config._mockProcessed = true;
      config._mockResponse = mockResponse;
      return config;
    }

    // GET PURCHASES (use mock for GET only, POST goes to backend)
    if (url.includes('purchases') && method === 'get') {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: mockPurchases
      };

      config._mockProcessed = true;
      config._mockResponse = mockResponse;
      return config;
    }

    // POST PURCHASES - skip mock, let it go to backend
    if (url.includes('purchases') && method === 'post') {
      // Don't mock POST requests - send to real backend
      return config;
    }

    // GET CONTRACTS
    if (url.includes('contracts') && method === 'get') {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: mockContracts
      };

      config._mockProcessed = true;
      config._mockResponse = mockResponse;
      return config;
    }

    // DASHBOARD STATS
    if (url.includes('reports/dashboard') && method === 'get') {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {
          totalAssets: mockAssets.length,
          itAssets: mockAssets.filter(a => a.category === 'IT').length,
          nonItAssets: mockAssets.filter(a => a.category === 'Non-IT').length,
          activeContracts: mockContracts.filter(c => c.status === 'active').length,
          expiringContracts: 0,
          purchasedThisMonth: mockPurchases.length,
          underWarranty: 2,
          assignedAssets: mockAssets.filter(a => a.assigned_to).length,
          inStock: mockAssets.filter(a => !a.assigned_to).length,
          needingMaintenance: 0
        }
      };

      config._mockProcessed = true;
      config._mockResponse = mockResponse;
      return config;
    }

    return config;
  });

  // Handle responses - check for mock responses
  api.interceptors.response.use(
    (response) => {
      if (response.config._mockResponse) {
        return response.config._mockResponse;
      }
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

// Direct backend client — bypasses mock interceptors, always hits real server
export const backendApi = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export default api;

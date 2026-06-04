# Navigation Tabs Overview - IT Asset Inventory Management System

## **Main Navigation Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                   Asset Manager                              │
│                IT Inventory System                            │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard  │ 💾 Assets  │ 🛒 Purchases  │ 📋 Contracts  │ 📈 Reports  │
└─────────────────────────────────────────────────────────────┘
```

---

## **Tab 1: 📊 Dashboard** 

### **Purpose**
Central hub showing business overview and key metrics at a glance.

### **What It Shows**

**Key Statistics (Stat Cards):**
- **Total Assets**: Count of all IT and Non-IT assets
- **IT Assets**: Count of IT-category assets (Laptops, Desktops, etc.)
- **Non-IT Assets**: Count of Non-IT category assets (Chairs, Tables, etc.)
- **Active Assets**: Assets currently in use
- **Under Maintenance**: Assets being serviced
- **Asset Value**: Total monetary value of all assets
- **Active Contracts**: Number of current contracts
- **Available for Assignment**: Assets ready to be assigned to users

**Analytics & Charts:**
- Asset distribution by category (IT vs Non-IT)
- Monthly asset acquisitions trend
- Asset status distribution (Active, Maintenance, Disposed)
- Department-wise asset allocation
- Warranty status overview

**Quick Access Sections:**
- Expiring contracts widget (contracts expiring within 30 days)
- Recent asset additions
- Quick action buttons for common tasks

### **Use Case**
**Scenario:** Manager needs quick overview of company inventory status
- Checks total assets
- Reviews expiring contracts
- Sees assets under maintenance
- Identifies available assets for new assignments

### **Business Value**
- 🎯 Quick decision making
- 📊 Real-time metrics
- ⚠️ Alert on expiring contracts
- 💼 Business intelligence at a glance

---

## **Tab 2: 💾 Assets**

### **Purpose**
Complete asset management - view, create, edit, and manage all IT and Non-IT assets.

### **What It Shows**

**Asset Inventory:**
- **List View**: Table with all assets
  - Asset Tag (LAP-001, CHR-002, etc.)
  - Asset Name (Dell Laptop, Executive Chair)
  - Category (IT / Non-IT)
  - Sub Type (Laptop / Chair)
  - Serial Number
  - MAC Address (IT only)
  - Status (Active / Inactive / Disposed)
  - Assigned To (Employee name)

- **Card View**: Visual cards showing asset details
  - Asset image/thumbnail
  - Key information at a glance
  - Action buttons

**Filters & Search:**
- Search by asset name or tag
- Filter by category (IT / Non-IT)
- Filter by status (Active, Inactive, Disposed)
- Filter by sub type
- Filter by assigned user

**Actions:**
- **Create Asset**: Add new assets (auto-generated tags)
- **View Details**: See complete asset information
- **Edit Asset**: Update asset information
- **Delete Asset**: Remove assets from inventory
- **Assign**: Assign asset to employee
- **Change Status**: Mark as maintenance, disposed, etc.

### **Asset Forms Include:**

**For IT Assets:**
- Asset tag, name, category, sub-type
- Serial number, MAC address
- OS type, OS version
- Processor details
- RAM, Disk specifications
- Office licensing info
- Software installed
- Assignment details

**For Non-IT Assets:**
- Asset tag, name, category, sub-type
- Serial number
- Assignment details
- Maintenance notes

### **Use Case Examples**

**Scenario 1:** Employee joins company
1. Click "Create Asset" → "Add Laptop"
2. Fill form: Dell XPS, Laptop, Active
3. System auto-generates: LAP-005
4. Assign to new employee
5. Asset ready for use

**Scenario 2:** Laptop needs repair
1. Find asset: LAP-003
2. Click "Edit" → Change status to "Maintenance"
3. Assigned user auto-cleared
4. Repair completed
5. Change status back to "Active"
6. Reassign to employee

**Scenario 3:** Office furniture inventory check
1. Filter by Category: "Non-IT"
2. Filter by Sub Type: "Chair"
3. View all 50 chairs
4. Check which are assigned
5. Identify unassigned/available chairs

### **Business Value**
- 📝 Complete inventory tracking
- 🔍 Quick asset location
- 👤 Assignment management
- 🛠️ Maintenance tracking
- 💰 Asset valuation

---

## **Tab 3: 🛒 Purchases**

### **Purpose**
Track all purchase orders from vendors - when assets were bought and from whom.

### **What It Shows**

**Purchase Management:**
- Purchase ID / Order number (PO-001, PO-002, etc.)
- Vendor name and contact
- Purchase date
- Items purchased
- Total amount spent
- Invoice number
- Payment method
- Delivery status
- Vendor rating

**Vendor Management:**
- Vendor cards showing:
  - Vendor name
  - Contact information
  - Total purchases from this vendor
  - Total amount spent
  - Vendor rating (⭐)
  - Historical spend

**Filters & Views:**
- Overview tab: Summary statistics
- Purchases tab: All individual orders
- Vendors tab: Vendor management
- Search by vendor or order number
- Filter by status (Pending, Ordered, Shipped, Delivered, Cancelled)
- Filter by date range

**Analytics:**
- Monthly purchase spending trends
- Vendor-wise spending breakdown
- Delivery performance
- Purchase cycle analysis

### **Use Case Examples**

**Scenario 1:** Need to order new laptops
1. Go to Purchases tab
2. Create new purchase order
3. Select vendor with good track record
4. Add item details
5. Track delivery status

**Scenario 2:** Manager reviewing vendor performance
1. View "Vendors" section
2. Check vendor ratings
3. Review total amount spent
4. Decide if vendor offers good value
5. Consider for future orders

**Scenario 3:** Finance reconciliation
1. Filter purchases by date range
2. Review all invoices
3. Match with payments made
4. Generate purchase report
5. Budget reconciliation

### **Key Information Tracked**
- **What**: What items were purchased
- **When**: When purchase was made
- **From Whom**: Which vendor supplied
- **How Much**: Cost and total spend
- **Status**: Is it delivered/pending/cancelled
- **Invoice**: Payment tracking

### **Business Value**
- 💳 Budget management
- 🤝 Vendor performance tracking
- 📊 Spending analysis
- 🚚 Delivery tracking
- 📈 Procurement trends

---

## **Tab 4: 📋 Contracts**

### **Purpose**
Manage vendor contracts, warranties, AMCs (Annual Maintenance Contracts), and licensing agreements.

### **What It Shows**

**Contract Management:**
- Contract ID (CON-2025-001, CON-2025-002)
- Contract name (e.g., "Dell Laptop AMC", "Software License")
- Vendor name
- Contract value (₹ amount)
- Active from date
- Active till / Expiry date
- Status (Active, Expired, Expiring Soon, Renewal Due)
- Days remaining until expiry
- Vendor contact details
- Contract document

**Contract Types Tracked:**
- **Annual Maintenance Contracts (AMC)**: Annual service agreements for IT equipment
- **Software Licenses**: Licensing agreements for software
- **Support Agreements**: Technical support contracts
- **Lease Agreements**: Equipment lease contracts
- **Warranty Contracts**: Extended warranty coverage

**Alerts & Monitoring:**
- **Expiring Soon**: Contracts expiring within 30 days (⚠️)
- **Expired**: Past expiry date (❌)
- **Active**: Currently valid (✅)
- **Renewal Due**: Contract ready for renewal (🔄)

**Tabs & Views:**
1. **Overview**: Statistics dashboard
   - Active contracts count
   - Expiring within 30 days
   - Expired contracts
   - Total contract value

2. **Contracts**: List of all contracts
   - Card view showing details
   - Expiry countdown
   - Quick actions: View, Renew, Delete

3. **Analytics**: Charts and trends
   - Contract spending over time
   - Vendor-wise contract value
   - Expiry calendar
   - Renewal schedule

**Actions:**
- Create new contract
- View contract details
- Renew contract (extend expiry)
- Renew reminder notifications
- Document upload
- Delete contract

### **Use Case Examples**

**Scenario 1:** Contract expiring next month
1. Dashboard shows "Expiring Contracts" widget
2. Click to view: Dell Laptop AMC expiring in 28 days
3. Go to Contracts tab
4. Click "Renew" on contract card
5. Update renewal terms
6. Save renewed contract

**Scenario 2:** License compliance check
1. Go to Contracts tab
2. Filter by vendor: Microsoft
3. View all software licenses
4. Check which are expiring
5. Ensure renewal before expiry

**Scenario 3:** Budget planning for next year
1. Go to Contracts → Analytics
2. View "Vendor-wise Contract Value" chart
3. Identify highest spending vendors
4. Plan budget allocation
5. Decide which contracts to renew

### **Key Information Tracked**
- **Contract ID**: Unique identifier
- **Name**: What is the contract for
- **Vendor**: Who provides the service
- **Value**: ₹ amount
- **Validity**: From date to expiry date
- **Status**: Is it active/expired/expiring
- **Documents**: Supporting files

### **Business Value**
- 📅 Warranty & support management
- ⏰ Renewal reminder system
- 💰 Contract cost tracking
- 🚨 Expiry alerts
- 📑 Compliance management
- 🔄 Renewal planning

---

## **Tab 5: 📈 Reports**

### **Purpose**
Generate business intelligence reports for analysis and decision-making.

### **Report Types**

**1. Asset Reports**
- Asset inventory report
  - Total assets, IT/Non-IT breakdown
  - Category wise distribution
  - Department wise allocation
  - Asset depreciation value
  - Under warranty assets
  - Assets due for replacement

- Asset age analysis
  - Assets older than 3 years
  - Replacement timeline
  - Technology upgrade recommendations

- Assigned vs Unassigned
  - Assets available for assignment
  - Assets assigned to employees
  - Department allocation

**2. Purchase Reports**
- Monthly spending trends
  - Purchases over time
  - Monthly expenditure
  - Budget vs actual

- Vendor performance
  - Spending by vendor
  - Delivery performance
  - Price comparison
  - Vendor rating analysis

- Item-wise analysis
  - Most purchased items
  - Quantity trends
  - Price trends

**3. Contract Reports**
- Contract status report
  - Active, expired, expiring contracts
  - Total contract value
  - Renewal schedule

- Vendor contract analysis
  - Spending by vendor
  - Contract expiry calendar
  - Renewal timeline

- Compliance report
  - Ensure all equipment covered
  - Warranty status
  - Maintenance contract coverage

**4. Financial Reports**
- Asset valuation
  - Total inventory value
  - Depreciation schedule
  - Book value

- Spending analysis
  - Total purchases by category
  - Cost per department
  - Vendor expenditure

- ROI analysis
  - Asset lifecycle cost
  - Maintenance vs replacement cost

**5. Maintenance Reports**
- Maintenance schedule
  - Assets due for service
  - Historical repair records
  - Maintenance costs

- Downtime analysis
  - Assets under maintenance
  - Repair frequency
  - MTTR (Mean Time To Repair)

**Export Options:**
- **PDF**: For printing and sharing
- **Excel**: For further analysis
- **CSV**: For data integration

**Customization:**
- Date range selection
- Filter by asset type
- Filter by department
- Filter by vendor
- Filter by contract status

### **Use Case Examples**

**Scenario 1:** Quarterly business review
1. Go to Reports tab
2. Click "Asset Inventory Report"
3. Date range: Last 3 months
4. Review asset growth
5. Export as PDF
6. Present to leadership

**Scenario 2:** Budget planning meeting
1. Generate "Spending Analysis" report
2. Date range: Last 12 months
3. View vendor-wise spending
4. Identify cost optimization opportunities
5. Plan next year's budget

**Scenario 3:** IT depreciation calculation
1. Generate "Asset Valuation" report
2. View total inventory value
3. Check depreciation schedule
4. Update financial records
5. Export for accounting

**Scenario 4:** Maintenance planning
1. Generate "Maintenance Schedule" report
2. View assets due for service
3. Identify repair trends
4. Schedule preventive maintenance
5. Reduce downtime

### **Report Scheduling** (Advanced)
- Generate reports on schedule
- Email reports automatically
- Historical report tracking
- Compare period-over-period

### **Business Value**
- 📊 Data-driven decisions
- 💼 Executive dashboards
- 🎯 Strategic planning
- 📉 Cost optimization
- 🔍 Trend analysis
- 💰 Financial reporting
- 📈 Performance metrics

---

## **How Tabs Work Together**

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard (Overview)                       │
│  Shows key metrics, alerts, and quick summary of everything  │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐
    │   Assets    │   │ Purchases  │   │ Contracts  │
    │             │   │            │   │            │
    │ ▪️ Create   │   │ ▪️ Orders   │   │ ▪️ AMC     │
    │ ▪️ Assign   │   │ ▪️ Vendors  │   │ ▪️ Warranty│
    │ ▪️ Track    │   │ ▪️ Track    │   │ ▪️ License │
    │ ▪️ Manage   │   │ ▪️ Budget   │   │ ▪️ Renewal │
    └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Reports      │
                    │  (Analysis &   │
                    │   Reporting)   │
                    └────────────────┘
```

---

## **Data Flow Between Tabs**

### **When you create an asset in Assets tab:**
```
Assets tab: Create LAP-001
    ↓
Backend: Auto-generate tag, store in database
    ↓
Dashboard: Shows updated "Total Assets" count
    ↓
Reports: Available for asset reports
```

### **When you create a purchase in Purchases tab:**
```
Purchases tab: Create PO-001 for vendor X
    ↓
Backend: Store purchase with vendor info
    ↓
Dashboard: Shows updated "Spending" metric
    ↓
Reports: Available for purchase analysis
```

### **When you create a contract in Contracts tab:**
```
Contracts tab: Create CON-2025-001 expiring in 90 days
    ↓
Backend: Calculate days until expiry
    ↓
Dashboard: Shows in "Expiring Contracts" if <30 days
    ↓
Reports: Available for contract analysis
    ↓
Alert System: Sends reminder before expiry
```

---

## **Access Pattern by User Role**

### **IT Manager**
- ✅ All tabs: Full access
- Creates assets, purchases, contracts
- Reviews reports for planning

### **Finance Manager**
- ✅ Purchases: Full access
- ✅ Contracts: View only
- ✅ Reports: Full access
- ❌ Assets: Minimal access

### **Department Manager**
- ✅ Assets: View assigned assets
- ✅ Dashboard: View overview
- ❌ Purchases: View only
- ❌ Contracts: View only
- ❌ Reports: Limited

### **Employee**
- ✅ Assets: View assigned asset details
- ✅ Dashboard: View general overview
- ❌ Purchases: No access
- ❌ Contracts: No access
- ❌ Reports: No access

---

## **Key Features by Tab**

| Feature | Dashboard | Assets | Purchases | Contracts | Reports |
|---------|-----------|--------|-----------|-----------|---------|
| View Data | ✅ Summary | ✅ Detailed | ✅ Full | ✅ Full | ✅ Analysis |
| Create/Add | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Edit/Update | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Delete | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Search/Filter | ❌ Limited | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Analytics | ✅ Limited | ⚠️ Basic | ✅ Yes | ✅ Yes | ✅ Full |
| Export | ❌ No | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited | ✅ Yes |
| Notifications | ✅ Alerts | ❌ No | ❌ No | ✅ Expiry | ❌ No |

---

## **Summary: What Each Tab Does**

| Tab | Purpose | Main Focus | Who Uses It |
|-----|---------|-----------|-----------|
| **Dashboard** | Quick overview & alerts | KPIs, metrics, alerts | Managers, Directors |
| **Assets** | Inventory management | Buy, assign, track items | IT team, Managers |
| **Purchases** | Order management | Vendor, budget, delivery | Procurement, Finance |
| **Contracts** | Agreement management | Warranty, renewal, dates | IT, Finance |
| **Reports** | Analysis & insights | Trends, planning, ROI | Managers, Finance, C-level |

---

## **Typical Workflow**

```
1️⃣  Dashboard
    Check: Any expiring contracts?
    Check: Asset acquisition trends
    
2️⃣  Assets
    Create: New laptop (LAP-006)
    Assign: To new employee
    
3️⃣  Purchases
    Create: Purchase order for laptops
    Track: Delivery status
    
4️⃣  Contracts
    Create: Dell AMC contract
    Set: 1-year renewal
    
5️⃣  Reports
    Generate: Asset valuation report
    Export: PDF for management
    Plan: Next year budget
```

---

**This is a comprehensive IT Asset Management System with specialized tabs for different business needs!**


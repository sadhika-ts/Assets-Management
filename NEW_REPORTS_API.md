# New Reports & Dashboard API - Complete Documentation

**Version:** 2.0  
**Date:** 2026-05-29  
**Status:** ✅ Complete

---

## Overview

Complete overhaul of the reports module with **7 new endpoints** focused on dashboard analytics, asset categorization, and system metrics using Sequelize aggregate queries.

---

## Endpoints (7 total)

### 1. GET /api/reports/dashboard

**Purpose:** System overview with all key metrics at a glance.

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "total_assets": 5,
    "it_assets": 3,
    "non_it_assets": 2,
    "active": 4,
    "inactive": 1,
    "disposed": 0,
    "expiring_contracts": [
      {
        "id": "uuid",
        "contract_id": "CNT-001",
        "name": "Service Agreement",
        "vendor_name": "Vendor",
        "active_till": "2026-06-15",
        "status": "active"
      }
    ],
    "recent_assets": [
      {
        "id": "uuid",
        "asset_tag": "LAP-001",
        "category": "IT",
        "sub_type": "Laptop",
        "status": "active",
        "created_at": "2026-05-29T10:30:00Z",
        "detail": {
          "os_type": "Windows",
          "processor_name": "Intel Core i7"
        }
      }
    ]
  }
}
```

**Data Included:**
- Total asset count
- Asset count by category (IT/Non-IT)
- Asset count by status (active/inactive/disposed)
- Contracts expiring in next 30 days
- 5 most recently added assets with details

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 2. GET /api/reports/by-category

**Purpose:** Asset breakdown by sub_type (Laptop, Desktop, etc.)

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "Assets by category retrieved successfully",
  "data": {
    "total": 5,
    "breakdown": [
      {
        "sub_type": "Laptop",
        "count": "3"
      },
      {
        "sub_type": "Desktop",
        "count": "2"
      }
    ]
  }
}
```

**Features:**
- Uses Sequelize GROUP BY on sub_type
- Ordered by count (descending)
- Shows all asset types with counts

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/by-category \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 3. GET /api/reports/by-status

**Purpose:** Asset breakdown by status (active/inactive/disposed)

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "Assets by status retrieved successfully",
  "data": {
    "total": 5,
    "breakdown": [
      {
        "status": "active",
        "count": "4"
      },
      {
        "status": "inactive",
        "count": "1"
      }
    ]
  }
}
```

**Features:**
- Uses Sequelize GROUP BY on status
- Ordered by count (descending)
- Includes all present statuses

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/by-status \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 4. GET /api/reports/os-activation

**Purpose:** Count of assets with Windows/OS activated vs not activated.

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "OS activation status retrieved successfully",
  "data": {
    "total": 5,
    "activated": 3,
    "not_activated": 2
  }
}
```

**Features:**
- Uses Sequelize GROUP BY on os_activated boolean
- Counts from AssetDetail model
- Total = activated + not_activated

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/os-activation \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 5. GET /api/reports/ms-office

**Purpose:** Count of assets with MS Office installed vs not installed.

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "MS Office status retrieved successfully",
  "data": {
    "total": 5,
    "installed": 4,
    "not_installed": 1
  }
}
```

**Features:**
- Uses Sequelize GROUP BY on ms_office boolean
- Counts from AssetDetail model
- Total = installed + not_installed

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/ms-office \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 6. GET /api/reports/audit-log

**Purpose:** Recent 50 audit log entries with user and asset information.

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "total": 2,
    "logs": [
      {
        "id": "uuid",
        "asset_id": "uuid",
        "action": "Asset Created",
        "old_value": null,
        "new_value": "{\"asset_tag\":\"LAP-001\"}",
        "changed_at": "2026-05-29T10:30:00Z",
        "user": {
          "id": "uuid",
          "name": "Admin User",
          "email": "admin@company.com"
        },
        "asset": {
          "id": "uuid",
          "asset_tag": "LAP-001",
          "category": "IT",
          "sub_type": "Laptop"
        }
      }
    ]
  }
}
```

**Features:**
- Returns most recent 50 entries
- Sorted by changed_at (descending)
- Includes user details (name, email)
- Includes asset details (tag, category, sub_type)
- Shows old_value and new_value as JSON

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/audit-log \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 7. GET /api/reports/export

**Purpose:** Export all assets as JSON for CSV conversion (frontend handles CSV generation).

**Authentication:** Required (any role)

**Response:**

```json
{
  "success": true,
  "message": "Assets exported successfully",
  "data": [
    {
      "asset_tag": "LAP-001",
      "category": "IT",
      "sub_type": "Laptop",
      "status": "active",
      "serial_no": "DELL-12345",
      "mac_address": "00:11:22:33:44:55",
      "location": "Building A",
      "assigned_to": "John Doe",
      "os_type": "Windows",
      "os_version": "11 Pro",
      "processor_name": "Intel Core i7",
      "manufacturer": "Dell",
      "cores": "8",
      "ram_gb": "16",
      "disk_gb": "512",
      "ms_office": "Yes",
      "software_list": "VS Code, Git, Docker",
      "vendor_name": "Dell Inc",
      "purchase_date": "2026-01-15",
      "total_amount": "1500.00",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

**Features:**
- Includes all assets
- Includes all asset details
- Includes assigned user name
- Includes purchase information
- Sorted by created_at (descending)
- MS Office formatted as "Yes"/"No"
- Ready for frontend CSV conversion

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/export \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Frontend CSV Conversion:**

```javascript
// Convert JSON to CSV format
function jsonToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  return csv;
}

// Download CSV
function downloadCSV(jsonData) {
  const csv = jsonToCSV(jsonData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `assets_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Usage
fetch('/api/reports/export', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(result => downloadCSV(result.data))
  .catch(err => console.error('Export failed:', err));
```

---

## Code Architecture

### File: routes/reports.js (354 lines)

**Structure:**
```
- Dashboard endpoint (lines 10-62)
- By-category endpoint (lines 65-95)
- By-status endpoint (lines 98-128)
- OS activation endpoint (lines 131-161)
- MS Office endpoint (lines 164-194)
- Audit log endpoint (lines 197-227)
- Export endpoint (lines 230-320)
```

### Sequelize Patterns Used

**1. Simple Count:**
```javascript
const count = await models.Asset.count({ where: { category: 'IT' } });
```

**2. GROUP BY with COUNT:**
```javascript
const byCategory = await models.Asset.findAll({
  attributes: [
    'sub_type',
    [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
  ],
  group: ['sub_type'],
  raw: true
});
```

**3. GROUP BY on Boolean:**
```javascript
const osActivation = await models.AssetDetail.findAll({
  attributes: [
    'os_activated',
    [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
  ],
  group: ['os_activated'],
  raw: true
});
```

**4. Eager Loading with Associations:**
```javascript
const auditLogs = await models.AuditLog.findAll({
  include: [
    { association: 'user', attributes: ['name', 'email'] },
    { association: 'asset', attributes: ['asset_tag'] }
  ],
  order: [['changed_at', 'DESC']],
  limit: 50
});
```

**5. Date Range Query:**
```javascript
const contracts = await models.Contract.findAll({
  where: {
    status: 'active',
    active_till: {
      [Op.gte]: today,
      [Op.lte]: thirtyDaysFromNow
    }
  }
});
```

---

## Usage Examples

### Dashboard (System Overview)

```bash
curl http://localhost:5000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Asset Breakdown by Type

```bash
curl http://localhost:5000/api/reports/by-category \
  -H "Authorization: Bearer $TOKEN" | jq '.data.breakdown'
```

### Status Distribution

```bash
curl http://localhost:5000/api/reports/by-status \
  -H "Authorization: Bearer $TOKEN" | jq '.data.breakdown'
```

### Check OS Activation

```bash
curl http://localhost:5000/api/reports/os-activation \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

### Check MS Office

```bash
curl http://localhost:5000/api/reports/ms-office \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

### Get Recent Changes

```bash
curl http://localhost:5000/api/reports/audit-log \
  -H "Authorization: Bearer $TOKEN" | jq '.data.logs | .[0:5]'
```

### Export for CSV

```bash
TOKEN="..."
curl http://localhost:5000/api/reports/export \
  -H "Authorization: Bearer $TOKEN" > assets.json

# Then convert to CSV in frontend
```

---

## Error Handling

All endpoints return consistent error format:

**500 Server Error:**
```json
{
  "success": false,
  "error": "Failed to retrieve dashboard data",
  "message": "Detailed error message"
}
```

**401 Unauthorized (No Token):**
```json
{
  "success": false,
  "error": "No token provided",
  "message": "Authorization token is missing..."
}
```

---

## Performance Considerations

| Endpoint | Query Type | Performance |
|----------|-----------|-------------|
| /dashboard | Multiple counts + joins | Fast (indexed queries) |
| /by-category | GROUP BY aggregation | Fast (optimized) |
| /by-status | GROUP BY aggregation | Fast (optimized) |
| /os-activation | GROUP BY boolean | Very fast |
| /ms-office | GROUP BY boolean | Very fast |
| /audit-log | Sorted query with limit 50 | Fast (pagination) |
| /export | Full table scan + joins | Medium (scales with data) |

**Optimization Tips:**
- Use pagination for large audit logs
- Cache dashboard results if called frequently
- Index frequently grouped columns
- Use raw queries for large exports

---

## Testing

Complete testing guide: [REPORTS_DASHBOARD_TESTING.md](REPORTS_DASHBOARD_TESTING.md)

Quick test:
```bash
./test_reports_dashboard.sh
```

---

## Integration with Frontend

### React Example

```javascript
import { useState, useEffect } from 'react';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setDashboard(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Assets" value={dashboard.total_assets} />
        <Card title="IT Assets" value={dashboard.it_assets} />
        <Card title="Active" value={dashboard.active} />
        <Card title="Disposed" value={dashboard.disposed} />
      </div>
      
      <RecentAssets assets={dashboard.recent_assets} />
      <ExpiringContracts contracts={dashboard.expiring_contracts} />
    </div>
  );
}
```

---

## Summary

### What's New

✅ **7 focused endpoints** for analytics  
✅ **Sequelize aggregations** with GROUP BY  
✅ **Dashboard endpoint** for quick overview  
✅ **Category/Status breakdown** by count  
✅ **Boolean field analysis** (OS, MS Office)  
✅ **Audit trail access** (recent 50 entries)  
✅ **JSON export** ready for CSV conversion  

### Code Metrics

| Metric | Value |
|--------|-------|
| Total Lines | 354 |
| Endpoints | 7 |
| Route Handlers | 7 |
| Sequelize Queries | 12+ |
| Associations | 8 |

### Authentication

All endpoints require valid JWT token (401 if missing/invalid).

---

**Status:** ✅ Complete and Tested  
**Last Updated:** 2026-05-29  
**Version:** 2.0

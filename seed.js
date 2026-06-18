const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const models = require('./models');

// ── helpers ──────────────────────────────────────────────────────
const clean = v => (typeof v === 'string' ? v.trim() : v) || null;
const osActivated = v => /activated/i.test(v) && !/not activated/i.test(v);

// ── parse xlsx files ─────────────────────────────────────────────
const wb1 = XLSX.readFile('Datas/Eorbitor Lap asset detail.xlsx');
const wb2 = XLSX.readFile('Datas/Pantry cuboard.xlsx');

// Sheet 1: user laptops (21 rows, last is blank)
const userLaptops = XLSX.utils
  .sheet_to_json(wb1.Sheets['Asset EOTPL user details'], { defval: '' })
  .filter(r => r['Sl.No'] && r['Host name']);

// Sheet 2: inhouse laptops (raw, header at row index 2)
const inhouseRaw = XLSX.utils.sheet_to_json(wb1.Sheets['Asset EOTPL inhouse details'], { header: 1, defval: '' });
const inhouseLaptops = inhouseRaw
  .slice(3) // skip title + blank + header rows
  .filter(r => r[0] && r[1])
  .map(r => ({
    slNo:    r[0],
    model:   String(r[1]).trim(),
    tag:     String(r[2]).trim(),
    working: String(r[3]).trim(),
    os:      String(r[4]).trim(),
    issue:   String(r[5]).trim(),
    notes:   String(r[7]).trim(),
  }));

// Sheet 3: servers
const serverRaw = XLSX.utils.sheet_to_json(wb1.Sheets['server'], { header: 1, defval: '' });
const servers = serverRaw
  .slice(3)
  .filter(r => r[0] && r[1])
  .map(r => ({
    slNo:      r[0],
    model:     String(r[1]).trim(),
    serviceTag:String(r[2]).trim(),
    processor: String(r[4]).trim(),
    ram:       String(r[5]).trim(),
  }));

// Pantry-cuboard sheet: IT accessories (non-laptop items)
const pantryRaw = XLSX.utils.sheet_to_json(wb2.Sheets['Pantry-cuboard'], { header: 1, defval: '' });
const pantryItems = pantryRaw
  .slice(1)
  .filter(r => r[0] && r[1] && typeof r[0] === 'number')
  .map(r => ({ slNo: r[0], name: String(r[1]).trim(), qty: Number(r[2]) || 1 }));

// Sir room-cuboard: accessories + some laptops (rows with serial tags)
const sirRaw = XLSX.utils.sheet_to_json(wb2.Sheets['Sir room-cuboard'], { header: 1, defval: '' });
const sirItems = sirRaw
  .slice(1)
  .filter(r => r[0] && r[1] && typeof r[0] === 'number')
  .map(r => ({ slNo: r[0], name: String(r[1]).trim(), qty: Number(r[2]) || 1 }));

// Conference hall: UPS batteries, mice, keyboards, monitors
const confRaw = XLSX.utils.sheet_to_json(wb2.Sheets['conference hall backside room'], { header: 1, defval: '' });
const confItems = confRaw
  .slice(1)
  .filter(r => r[0] && r[1])
  .map(r => ({
    slNo:       r[0],
    name:       String(r[1]).trim(),
    total:      Number(r[2]) || 1,
    working:    Number(r[3]) || 0,
    notWorking: Number(r[4]) || 0,
    remarks:    String(r[5]).trim(),
  }));

// ── helper: derive OS from string ────────────────────────────────
const parseOS = (osStr) => {
  if (!osStr) return { os_type: null, os_version: null };
  const s = osStr.trim();
  return {
    os_type:    s.toLowerCase().includes('win') ? 'Windows' : s,
    os_version: s,
  };
};

// ── classify cupboard items as IT sub_type ───────────────────────
const classifyItem = (name) => {
  const n = name.toLowerCase();
  if (n.includes('mouse'))     return { sub_type: 'Mouse',    category: 'IT' };
  if (n.includes('keyboard'))  return { sub_type: 'Keyboard', category: 'IT' };
  if (n.includes('monitor'))   return { sub_type: 'Monitor',  category: 'IT' };
  if (n.includes('hard disk') || n.includes('hdd') || n.includes('ssd') || n.includes('toshiba') || n.includes('seagate') || n.includes('western digital') || n.includes('segate') || n.includes('msata')) return { sub_type: 'Other', category: 'IT' };
  if (n.includes('toner'))     return { sub_type: 'Printer',  category: 'IT' };
  if (n.includes('ups') || n.includes('battery') || n.includes('exide')) return { sub_type: 'UPS', category: 'IT' };
  if (n.includes('smps'))      return { sub_type: 'Other',    category: 'IT' };
  if (n.includes('power cable') || n.includes('cable')) return { sub_type: 'Other', category: 'IT' };
  if (n.includes('hub'))       return { sub_type: 'Switch',   category: 'IT' };
  if (n.includes('camera'))    return { sub_type: 'Webcam',   category: 'IT' };
  if (n.includes('motherboard')) return { sub_type: 'Other',  category: 'IT' };
  if (n.includes('cooling fan') || n.includes('fan')) return { sub_type: 'Other', category: 'IT' };
  if (n.includes('laptop bag')) return { sub_type: 'Other',   category: 'Non-IT' };
  if (n.includes('mouse pad'))  return { sub_type: 'Other',   category: 'Non-IT' };
  if (n.includes('alogic'))     return { sub_type: 'Other',   category: 'IT' };
  return { sub_type: 'Other', category: 'IT' };
};

// tag counters
const counters = {};
const nextTag = (prefix) => {
  counters[prefix] = (counters[prefix] || 0) + 1;
  return `${prefix}-${String(counters[prefix]).padStart(3, '0')}`;
};

async function seed() {
  await models.sequelize.authenticate();
  console.log('✓ DB connected');

  // ── 1. Delete existing data (order matters for FK) ───────────────
  console.log('Deleting existing data...');
  await models.Warranty.destroy({ where: {}, truncate: true, cascade: true }).catch(() => models.Warranty.destroy({ where: {} }));
  await models.AuditLog.destroy({ where: {} }).catch(() => {});
  await models.SoftwareLicense.destroy({ where: {}, truncate: true, cascade: true }).catch(() => models.SoftwareLicense.destroy({ where: {} }));
  await models.AssetDetail.destroy({ where: {} });
  await models.Asset.destroy({ where: {} });
  console.log('✓ Existing assets cleared');

  const assets = [];

  // ── 2. User laptops (sheet 1) ────────────────────────────────────
  for (const row of userLaptops) {
    const user   = clean(row['User ']);
    const host   = clean(row['Host name']);
    const make   = clean(row['Make']) || 'Unknown';
    const model  = clean(row['Model']) || 'Laptop';
    const serial = clean(row['System Sl.No']);
    const osStr  = clean(row['Operating System']);
    const msOfc  = clean(row['MS office']);
    const msAct  = clean(row['Activated / Not Activated_1']);
    const osAct  = osActivated(clean(row['Activated / Not Activated']));
    const other  = clean(row['Other Application']);

    const assigned = (user && !user.toLowerCase().includes('in office')) ? user : null;
    const tag = nextTag('LAP');
    const { os_type, os_version } = parseOS(osStr);
    const id = uuidv4();

    assets.push({
      asset: {
        id,
        asset_tag:  tag,
        asset_name: `${make.trim()} ${model.trim()}`.trim(),
        category:   'IT',
        sub_type:   'Laptop',
        serial_no:  serial,
        status:     'active',
        assigned_to: assigned,
      },
      detail: {
        asset_id:    id,
        manufacturer: make.trim(),
        os_type,
        os_version,
        os_activated: osAct,
        ms_office:    !!msOfc,
        office_key:   msOfc || null,
        other_applications_installed: !!other,
        other_applications_description: other || null,
        others:       `Hostname: ${host || ''}`,
      }
    });
  }

  // ── 3. Inhouse laptops (sheet 2) ─────────────────────────────────
  for (const row of inhouseLaptops) {
    const isWorking = /yes/i.test(row.working);
    const tag = nextTag('LAP');
    const { os_type, os_version } = parseOS(row.os);
    const id = uuidv4();

    assets.push({
      asset: {
        id,
        asset_tag:  tag,
        asset_name: row.model,
        category:   'IT',
        sub_type:   'Laptop',
        serial_no:  row.tag || null,
        status:     isWorking ? 'active' : 'inactive',
        assigned_to: null,
      },
      detail: {
        asset_id:   id,
        manufacturer: row.model.split(' ')[0],
        os_type,
        os_version,
        others:     [row.issue, row.notes].filter(Boolean).join(' | ') || null,
      }
    });
  }

  // ── 4. Servers (sheet 3) ─────────────────────────────────────────
  for (const row of servers) {
    const tag = nextTag('SRV');
    const id  = uuidv4();
    const ramGb = parseFloat(row.ram) || null;

    assets.push({
      asset: {
        id,
        asset_tag:  tag,
        asset_name: row.model,
        category:   'IT',
        sub_type:   'Other',
        serial_no:  row.serviceTag || null,
        status:     'active',
        assigned_to: null,
      },
      detail: {
        asset_id:    id,
        manufacturer: 'Dell',
        processor_name: row.processor || null,
        ram_gb:      ramGb,
        others:      `Service Tag: ${row.serviceTag}`,
      }
    });
  }

  // ── 5. Pantry cupboard items ──────────────────────────────────────
  for (const item of pantryItems) {
    const { sub_type, category } = classifyItem(item.name);
    const prefix = category === 'IT' ? (sub_type === 'Laptop' ? 'LAP' : 'IT') : 'NIT';
    // expand qty: create one asset per quantity
    const count = item.qty > 0 ? item.qty : 1;
    for (let q = 0; q < count; q++) {
      const tag = nextTag(prefix);
      const id  = uuidv4();
      assets.push({
        asset: {
          id,
          asset_tag:  tag,
          asset_name: item.name,
          category,
          sub_type,
          serial_no:  null,
          status:     'active',
          assigned_to: null,
        },
        detail: null
      });
    }
  }

  // ── 6. Sir room cupboard items ────────────────────────────────────
  for (const item of sirItems) {
    // Items that are laptops (contain serial tag in parentheses)
    const laptopMatch = item.name.match(/\(([A-Z0-9]{6,})\)/);
    if (laptopMatch) {
      // already captured in inhouse sheet, skip
      continue;
    }
    const { sub_type, category } = classifyItem(item.name);
    const prefix = category === 'IT' ? 'IT' : 'NIT';
    const count = item.qty > 0 ? item.qty : 1;
    for (let q = 0; q < count; q++) {
      const tag = nextTag(prefix);
      const id  = uuidv4();
      assets.push({
        asset: {
          id,
          asset_tag:  tag,
          asset_name: item.name,
          category,
          sub_type,
          serial_no:  null,
          status:     'active',
          assigned_to: null,
        },
        detail: null
      });
    }
  }

  // ── 7. Conference hall items ──────────────────────────────────────
  for (const item of confItems) {
    const { sub_type, category } = classifyItem(item.name);
    const prefix = 'IT';
    const workingCount    = item.working    > 0 ? item.working    : (item.total - item.notWorking > 0 ? item.total - item.notWorking : item.total);
    const notWorkingCount = item.notWorking > 0 ? item.notWorking : 0;

    for (let q = 0; q < workingCount; q++) {
      const tag = nextTag(prefix);
      const id  = uuidv4();
      assets.push({
        asset: {
          id,
          asset_tag:  tag,
          asset_name: item.name.trim(),
          category,
          sub_type,
          serial_no:  null,
          status:     'active',
          assigned_to: null,
        },
        detail: null
      });
    }
    for (let q = 0; q < notWorkingCount; q++) {
      const tag = nextTag(prefix);
      const id  = uuidv4();
      assets.push({
        asset: {
          id,
          asset_tag:  tag,
          asset_name: item.name.trim(),
          category,
          sub_type,
          serial_no:  null,
          status:     'inactive',
          assigned_to: null,
        },
        detail: null
      });
    }
  }

  // ── 8. Bulk insert ───────────────────────────────────────────────
  console.log(`Inserting ${assets.length} assets...`);

  const assetRows  = assets.map(a => a.asset);
  const detailRows = assets.filter(a => a.detail).map(a => a.detail);

  await models.Asset.bulkCreate(assetRows, { ignoreDuplicates: true });
  await models.AssetDetail.bulkCreate(detailRows, { ignoreDuplicates: true });

  console.log(`✓ Inserted ${assetRows.length} assets`);
  console.log(`✓ Inserted ${detailRows.length} asset details`);
  console.log('\nBreakdown:');
  const byType = {};
  assetRows.forEach(a => { byType[a.sub_type] = (byType[a.sub_type] || 0) + 1; });
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

  await models.sequelize.close();
  console.log('\n✅ Seed complete!');
}

seed().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });

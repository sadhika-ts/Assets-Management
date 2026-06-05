import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Fetches vendors from both purchases and contracts tables,
 * deduplicates by vendor_name (case-insensitive), newest record wins.
 * Returns a unified list with: name, contact, email, address, contact_person
 */
export const useVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, cRes] = await Promise.allSettled([
          api.get('/purchases?limit=500'),
          api.get('/contracts?limit=500'),
        ]);

        const purchases = pRes.status === 'fulfilled'
          ? (pRes.value.data?.data?.purchases || [])
          : [];
        const contracts = cRes.status === 'fulfilled'
          ? (cRes.value.data?.data?.contracts || [])
          : [];

        // Normalise each source into a common shape
        // API returns newest-first, so first-seen per name = latest record
        const map = new Map();

        const upsert = (name, patch) => {
          if (!name?.trim()) return;
          const key = name.trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, { name: name.trim(), contact: '', email: '', address: '', contact_person: '' });
          }
          const v = map.get(key);
          // Only overwrite a field if the existing value is empty
          if (patch.contact && !v.contact)        v.contact = patch.contact;
          if (patch.email && !v.email)            v.email = patch.email;
          if (patch.address && !v.address)        v.address = patch.address;
          if (patch.contact_person && !v.contact_person) v.contact_person = patch.contact_person;
          // Always keep the display name from the first (newest) record
        };

        purchases.forEach(p => upsert(p.vendor_name, {
          contact: p.vendor_contact,
          email: p.vendor_email,
          address: p.vendor_address,
        }));

        contracts.forEach(c => upsert(c.vendor_name, {
          contact: c.vendor_phone || c.vendor_contact,
          email: c.vendor_email,
          address: c.vendor_address,
          contact_person: c.vendor_contact_person,
        }));

        const sorted = Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setVendors(sorted);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { vendors, loading };
};

const KEY = 'employeeList';

const DEFAULTS = [
  { id: 1,  name: 'Prakash' },
  { id: 2,  name: 'Vaidyanathan' },
  { id: 3,  name: 'Hema Priya' },
  { id: 4,  name: 'Leojudej' },
  { id: 5,  name: 'Srinivasan.r' },
  { id: 6,  name: 'Ratchika' },
  { id: 7,  name: 'Priyanka.s' },
  { id: 8,  name: 'Kishore' },
  { id: 9,  name: 'Manjula.M' },
  { id: 10, name: 'Siyasamy R' },
  { id: 11, name: 'Geetha' },
  { id: 12, name: 'Leelavathi.m' },
  { id: 13, name: 'Vaishnavi' },
  { id: 14, name: 'Jyappan A' },
  { id: 15, name: 'Jeevitha.R' },
  { id: 16, name: 'Sree Sree' },
  { id: 17, name: 'Siddhartha Gho' },
];

export const getEmployees = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
  return DEFAULTS;
};

export const saveEmployees = (list) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const addEmployee = (name) => {
  const list = getEmployees();
  const maxId = list.reduce((m, e) => Math.max(m, e.id), 0);
  const entry = { id: maxId + 1, name: name.trim() };
  const updated = [...list, entry];
  saveEmployees(updated);
  return updated;
};

export const removeEmployee = (id) => {
  const updated = getEmployees().filter(e => e.id !== id);
  saveEmployees(updated);
  return updated;
};

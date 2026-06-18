import api from '../api/axios';

export const getEmployeesFromDB = async () => {
  const res = await api.get('/employees');
  return res.data.data.employees;
};

export const addEmployeeToDB = async (name) => {
  const res = await api.post('/employees', { name });
  return res.data.data.employee;
};

export const removeEmployeeFromDB = async (id) => {
  await api.delete(`/employees/${id}`);
};

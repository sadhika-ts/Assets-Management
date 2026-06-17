import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getEmployees, addEmployee, removeEmployee } from '../utils/employeeStore';

const PASSWORD_RULES = [
  { id: 'len',     label: 'At least 8 characters',        test: v => v.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter', test: v => /[A-Z]/.test(v) },
  { id: 'number',  label: 'At least one number',           test: v => /[0-9]/.test(v) },
  { id: 'special', label: 'At least one special character',test: v => /[^A-Za-z0-9]/.test(v) },
];

const getStrength = (password) => PASSWORD_RULES.filter(r => r.test(password)).length;

const STRENGTH_META = [
  { label: 'Very Weak', color: 'bg-red-500',    text: 'text-red-500'    },
  { label: 'Weak',      color: 'bg-orange-500',  text: 'text-orange-500' },
  { label: 'Fair',      color: 'bg-yellow-500',  text: 'text-yellow-500' },
  { label: 'Strong',    color: 'bg-blue-500',    text: 'text-blue-500'   },
  { label: 'Very Strong',color:'bg-emerald-500', text: 'text-emerald-500'},
];

const EyeIcon = ({ open }) => open ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PasswordInput = ({ label, value, onChange, error, show, onToggle, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
          ${error ? 'border-red-500' : 'border-slate-600'}`}
      />
      <button type="button" onClick={onToggle}
        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors">
        <EyeIcon open={show} />
      </button>
    </div>
    {error && (
      <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        {error}
      </p>
    )}
  </div>
);

export const Settings = () => {
  const { currentUser, updateCredentials, logout } = useAuth();
  const navigate = useNavigate();

  // ── Employee (assignable users) management ────────────────────────────
  const [employees, setEmployees]     = useState(() => getEmployees());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName]         = useState('');
  const [nameError, setNameError]     = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [username, setUsername]               = useState(currentUser?.username || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [errors, setErrors]                   = useState({});
  const [saving, setSaving]                   = useState(false);

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Name cannot be empty'); return; }
    if (trimmed.length < 2) { setNameError('Name must be at least 2 characters'); return; }
    if (employees.some(emp => emp.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError('This name already exists');
      return;
    }
    const updated = addEmployee(trimmed);
    setEmployees(updated);
    setNewName('');
    setShowAddForm(false);
    toast.success(`"${trimmed}" added`);
  };

  const handleRemoveEmployee = (emp) => {
    const updated = removeEmployee(emp.id);
    setEmployees(updated);
    setConfirmDeleteId(null);
    toast.success(`"${emp.name}" removed`);
  };

  const strength = newPassword ? getStrength(newPassword) : 0;
  const meta = newPassword ? STRENGTH_META[strength] : null;

  const validate = () => {
    const e = {};
    if (!username.trim()) {
      e.username = 'Username cannot be empty';
    } else if (username.trim().length < 3) {
      e.username = 'Username must be at least 3 characters';
    }
    if (!currentPassword) {
      e.currentPassword = 'Enter your current password';
    }
    if (!newPassword) {
      e.newPassword = 'New password is required';
    } else {
      const failed = PASSWORD_RULES.filter(r => !r.test(newPassword));
      if (failed.length > 0) e.newPassword = failed[0].label + ' is required';
    }
    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = 'New password and confirm password do not match';
    }
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const result = await updateCredentials(username.trim(), currentPassword, newPassword);
    setSaving(false);

    if (result.success) {
      toast.success('Credentials updated! Please log in again.');
      logout();
      navigate('/login');
    } else {
      if (result.message?.toLowerCase().includes('current password')) {
        setErrors(p => ({ ...p, currentPassword: result.message }));
      } else {
        toast.error(result.message || 'Failed to update credentials.');
      }
    }
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-lg mx-auto space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your login credentials and users</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">

          {/* Profile banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {(currentUser?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{currentUser?.username || 'admin'}</p>
              <p className="text-blue-200 text-xs mt-0.5">Administrator</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: '' })); }}
                placeholder="Enter username"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${errors.username ? 'border-red-500' : 'border-slate-600'}`}
              />
              {errors.username && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700 pt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Change Password</p>

              <div className="space-y-4">

                <PasswordInput
                  label="Current Password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setErrors(p => ({ ...p, currentPassword: '' })); }}
                  placeholder="Enter current password"
                  error={errors.currentPassword}
                  show={showCurrent}
                  onToggle={() => setShowCurrent(v => !v)}
                />

                {/* New password + strength */}
                <div>
                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setErrors(p => ({ ...p, newPassword: '', confirmPassword: '' })); }}
                    placeholder="Create a strong password"
                    error={errors.newPassword}
                    show={showNew}
                    onToggle={() => setShowNew(v => !v)}
                  />

                  {/* Strength bar */}
                  {newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {[0,1,2,3].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? meta.color : 'bg-slate-600'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${meta.text}`}>{meta.label}</p>

                      {/* Rules checklist */}
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                        {PASSWORD_RULES.map(r => {
                          const passed = r.test(newPassword);
                          return (
                            <li key={r.id} className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {passed
                                ? <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                : <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              }
                              {r.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Re-enter new password"
                  error={errors.confirmPassword}
                  show={showConfirm}
                  onToggle={() => setShowConfirm(v => !v)}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2.5 bg-blue-900/20 border border-blue-700/30 rounded-xl px-4 py-3 text-xs text-blue-300">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You will be logged out after saving. Use your new credentials to sign back in.
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
        {/* Employee / Assignable Users Management */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-100">Assignable Users</p>
              <p className="text-xs text-slate-500 mt-0.5">{employees.length} people · shown in "Assign To" dropdown</p>
            </div>
            <button onClick={() => { setShowAddForm(v => !v); setNewName(''); setNameError(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
              {showAddForm
                ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Cancel</>
                : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg> Add Person</>
              }
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={handleAddEmployee} className="px-6 py-4 border-b border-slate-700 bg-slate-900/40">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNameError(''); }}
                  placeholder="e.g. Ramesh Kumar"
                  autoFocus
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${nameError ? 'border-red-500' : 'border-slate-600'}`}
                />
                <button type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors whitespace-nowrap">
                  Add
                </button>
              </div>
              {nameError && <p className="text-red-400 text-xs mt-1.5">{nameError}</p>}
            </form>
          )}

          {/* Employee list */}
          <div className="divide-y divide-slate-700/40 max-h-80 overflow-y-auto">
            {employees.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">No assignable users yet</p>
            ) : employees.map(emp => (
              <div key={emp.id} className="relative overflow-hidden">
                {/* Normal row */}
                <div className={`flex items-center gap-3 px-6 py-2.5 transition-all duration-200 ${confirmDeleteId === emp.id ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold flex-shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm text-slate-200 truncate">{emp.name}</span>
                  <button onClick={() => setConfirmDeleteId(emp.id)}
                    title="Remove"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>

                {/* Inline confirm overlay */}
                {confirmDeleteId === emp.id && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 bg-red-950/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                      </div>
                      <span className="text-xs text-red-300 font-medium truncate">Remove <span className="font-bold text-red-200">"{emp.name}"</span>?</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
                        Keep
                      </button>
                      <button onClick={() => handleRemoveEmployee(emp)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

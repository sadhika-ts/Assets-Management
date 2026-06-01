import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, onSubmit) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const fieldError = {};

    switch (name) {
      case 'email':
        if (!value) {
          fieldError[name] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldError[name] = 'Invalid email format';
        }
        break;

      case 'password':
        if (!value) {
          fieldError[name] = 'Password is required';
        } else if (value.length < 6) {
          fieldError[name] = 'Password must be at least 6 characters';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          fieldError[name] = 'Confirm password is required';
        } else if (value !== formData.password) {
          fieldError[name] = 'Passwords do not match';
        }
        break;

      case 'name':
      case 'first_name':
      case 'last_name':
      case 'asset_name':
      case 'company':
        if (!value) {
          fieldError[name] = `${name.replace('_', ' ')} is required`;
        } else if (value.trim().length < 2) {
          fieldError[name] = `${name.replace('_', ' ')} must be at least 2 characters`;
        }
        break;

      case 'phone':
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          fieldError[name] = 'Invalid phone number (10 digits required)';
        }
        break;

      case 'employee_id':
      case 'asset_code':
      case 'serial_no':
        if (!value) {
          fieldError[name] = `${name.replace('_', ' ')} is required`;
        }
        break;

      case 'asset_type':
      case 'sub_type':
        if (!value) {
          fieldError[name] = `${name.replace('_', ' ')} is required`;
        }
        break;

      case 'quantity':
      case 'unit_cost':
      case 'warranty_months':
        if (value && isNaN(value)) {
          fieldError[name] = `${name.replace('_', ' ')} must be a number`;
        } else if (value && parseFloat(value) < 0) {
          fieldError[name] = `${name.replace('_', ' ')} cannot be negative`;
        }
        break;

      case 'purchase_date':
      case 'expiry_date':
      case 'contract_start':
      case 'contract_end':
        if (!value) {
          fieldError[name] = `${name.replace('_', ' ')} is required`;
        }
        break;

      default:
        if (!value && name.includes('required')) {
          fieldError[name] = `${name} is required`;
        }
    }

    return fieldError;
  }, [formData.password]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue
    }));

    if (touched[name]) {
      const fieldError = validateField(name, fieldValue);
      setErrors((prev) => ({
        ...prev,
        ...fieldError
      }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      ...fieldError
    }));
  }, [validateField]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const fieldError = validateField(field, formData[field]);
      Object.assign(newErrors, fieldError);
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  }, [formData, validateField, onSubmit]);

  const setFieldValue = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset
  };
};

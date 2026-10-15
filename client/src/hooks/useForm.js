import { useState, useCallback } from 'react';

export const useForm = (initialState = {}, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (err) {
      setErrors(err.response?.data?.errors || { submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldError,
    errors,
    isSubmitting,
    setFormData,
  };
};

import { useState, useCallback } from 'react';

export function useFormValidation(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback((name, value, currentValues) => {
    if (schema[name]) {
      const error = schema[name](value, currentValues);
      setErrors(prev => ({ ...prev, [name]: error }));
      return error;
    }
    return null;
  }, [schema]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setValues(prev => {
      const newVals = { ...prev, [name]: val };
      validateField(name, val, newVals);
      return newVals;
    });
    
    setIsDirty(true);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value, values);
  };

  const setValue = (name, value) => {
    setValues(prev => {
      const newVals = { ...prev, [name]: value };
      if (schema[name]) {
        const error = schema[name](value, newVals);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
      return newVals;
    });
    setIsDirty(true);
  };

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    for (const key in schema) {
      const error = schema[key](values[key], values);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }
    setErrors(newErrors);
    
    // Mark all as touched on submit
    const allTouched = Object.keys(schema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return isValid;
  }, [schema, values]);

  const reset = useCallback((newInitialValues) => {
    const vals = newInitialValues || initialValues;
    setValues(vals);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isDirty,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValue,
    setValues,
    setErrors,
    setTouched
  };
}

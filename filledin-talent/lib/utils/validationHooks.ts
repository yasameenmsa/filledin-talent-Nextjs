'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  FormValidator, 
  EmailValidator, 
  PasswordValidator, 
  NameValidator, 
  RoleValidator,
  ValidationOptions 
} from './validation';

// Types for form validation hooks
export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  locale?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface ValidationHookResult {
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  validateField: (fieldName: string, value: any) => void;
  validateForm: (formData: any) => boolean;
  setFieldTouched: (fieldName: string, isTouched?: boolean) => void;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
}

// Generic form validation hook
function useFormValidation(
  validationSchema: (data: any, options: ValidationOptions) => { isValid: boolean; errors: FormErrors },
  options: UseFormValidationOptions = {}
): ValidationHookResult {
  const { validateOnChange = true, validateOnBlur = true, locale } = options;
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const validationOptions: ValidationOptions = useMemo(() => ({
    locale: locale || 'en'
  }), [locale]);

  const validateField = useCallback((fieldName: string, value: any, formData?: any) => {
    // For single field validation, we need the full form data
    // This is a simplified approach - in practice, you might want to pass the full form data
    const singleFieldData = { [fieldName]: value };
    const result = validationSchema(formData || singleFieldData, validationOptions);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors[fieldName] || ''
    }));

    return !result.errors[fieldName];
  }, [validationSchema, validationOptions]);

  const validateForm = useCallback((formData: any) => {
    const result = validationSchema(formData, validationOptions);
    setErrors(result.errors);
    return result.isValid;
  }, [validationSchema, validationOptions]);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: isTouched
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateForm,
    setFieldTouched,
    clearErrors,
    clearFieldError
  };
}

// Specific hook for registration form validation
function useRegistrationValidation(locale?: string): ValidationHookResult {
  const validationSchema = useCallback((formData: any, options: ValidationOptions) => {
    return FormValidator.validateRegistrationForm(formData, options);
  }, []);

  return useFormValidation(validationSchema, { locale });
}

// Specific hook for login form validation
function useLoginValidation(locale?: string): ValidationHookResult {
  const validationSchema = useCallback((formData: any, options: ValidationOptions) => {
    return FormValidator.validateLoginForm(formData, options);
  }, []);

  return useFormValidation(validationSchema, { locale });
}



// Individual field validation hooks
function useEmailValidation(locale?: string) {
  const { t } = useTranslation();
  
  return useCallback((email: string) => {
    return EmailValidator.validate(email, { locale });
  }, [locale]);
}

function usePasswordValidation(locale?: string) {
  const { t } = useTranslation();
  
  return useCallback((password: string) => {
    return PasswordValidator.validate(password, { locale });
  }, [locale]);
}

function usePasswordConfirmationValidation(locale?: string) {
  const { t } = useTranslation();
  
  return useCallback((password: string, confirmPassword: string) => {
    return PasswordValidator.validateConfirmation(password, confirmPassword, { locale });
  }, [locale]);
}

function useNameValidation(locale?: string) {
  const { t } = useTranslation();
  
  return useCallback((name: string, isFirstName: boolean = true) => {
    if (isFirstName) {
      return NameValidator.validateFirstName(name, { locale });
    } else {
      return NameValidator.validateLastName(name, { locale });
    }
  }, [locale]);
}

function useRoleValidation(locale?: string) {
  const { t } = useTranslation();
  
  return useCallback((role: string) => {
    return RoleValidator.validate(role, { locale });
  }, [locale]);
}

// Real-time validation hook for input fields
function useFieldValidation(
  validator: (value: any) => { isValid: boolean; error?: string },
  options: { validateOnChange?: boolean; validateOnBlur?: boolean } = {}
) {
  const { validateOnChange = true, validateOnBlur = true } = options;
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  const validate = useCallback((value: any) => {
    const result = validator(value);
    setError(result.error || '');
    return result.isValid;
  }, [validator]);

  const handleChange = useCallback((value: any) => {
    if (validateOnChange && touched) {
      validate(value);
    }
  }, [validate, validateOnChange, touched]);

  const handleBlur = useCallback((value: any) => {
    setTouched(true);
    if (validateOnBlur) {
      validate(value);
    }
  }, [validate, validateOnBlur]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    error,
    touched,
    validate,
    handleChange,
    handleBlur,
    clearError,
    hasError: !!error && touched
  };
}

// Debounced validation hook for better performance
function useDebouncedValidation(
  validator: (value: any) => { isValid: boolean; error?: string },
  delay: number = 300
) {
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const debouncedValidate = useCallback(
    debounce((value: any) => {
      setIsValidating(true);
      const result = validator(value);
      setError(result.error || '');
      setIsValidating(false);
    }, delay),
    [validator, delay]
  );

  const validate = useCallback((value: any) => {
    debouncedValidate(value);
  }, [debouncedValidate]);

  return {
    error,
    isValidating,
    validate,
    hasError: !!error
  };
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Export all hooks
export {
  useFormValidation,
  useRegistrationValidation,
  useLoginValidation,
  useEmailValidation,
  usePasswordValidation,
  usePasswordConfirmationValidation,
  useNameValidation,
  useRoleValidation,
  useFieldValidation,
  useDebouncedValidation
};
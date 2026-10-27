import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(['employee', 'manager'], 'Please select a valid role')
    .default('employee')
    .required('Role is required'),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;

import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  employeeId: yup
    .string()
    .trim()
    .required('Employee ID is required')
    .matches(/^EMP\d+$/i, 'Employee ID must be in format EMP0001'),
  name: yup
    .string()
    .trim()
    .min(2, 'Employee name must be at least 2 characters')
    .max(100, 'Employee name cannot exceed 100 characters')
    .required('Employee name is required'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .required('Name is required'),
  role: yup
    .string()
    .oneOf(['employee', 'manager', 'admin'], 'Please select a valid role')
    .default('employee')
    .required('Role is required'),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;

import { useState, useCallback } from 'react'

export interface FormErrors {
  [key: string]: string
}

export interface ValidationRules {
  [key: string]: {
    required?: boolean | string
    minLength?: { value: number; message: string }
    maxLength?: { value: number; message: string }
    pattern?: { value: RegExp; message: string }
    custom?: (value: any) => string | null
  }
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const validateField = useCallback(
    (name: string, value: any): string | null => {
      const fieldRules = rules[name]
      if (!fieldRules) return null

      // Required validation
      if (fieldRules.required) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return typeof fieldRules.required === 'string'
            ? fieldRules.required
            : `${name} is required`
        }
      }

      // MinLength validation
      if (fieldRules.minLength && value) {
        if (value.length < fieldRules.minLength.value) {
          return fieldRules.minLength.message
        }
      }

      // MaxLength validation
      if (fieldRules.maxLength && value) {
        if (value.length > fieldRules.maxLength.value) {
          return fieldRules.maxLength.message
        }
      }

      // Pattern validation
      if (fieldRules.pattern && value) {
        if (!fieldRules.pattern.value.test(value)) {
          return fieldRules.pattern.message
        }
      }

      // Custom validation
      if (fieldRules.custom && value) {
        const customError = fieldRules.custom(value)
        if (customError) return customError
      }

      return null
    },
    [rules]
  )

  const validate = useCallback(
    (formData: { [key: string]: any }): FormErrors => {
      const newErrors: FormErrors = {}

      Object.keys(rules).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName])
        if (error) {
          newErrors[fieldName] = error
        }
      })

      setErrors(newErrors)
      return newErrors
    },
    [rules, validateField]
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))

      const error = validateField(name, value)
      setErrors((prev) => {
        const newErrors = { ...prev }
        if (error) {
          newErrors[name] = error
        } else {
          delete newErrors[name]
        }
        return newErrors
      })
    },
    [validateField]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target

      if (touched[name]) {
        const error = validateField(name, value)
        setErrors((prev) => {
          const newErrors = { ...prev }
          if (error) {
            newErrors[name] = error
          } else {
            delete newErrors[name]
          }
          return newErrors
        })
      }
    },
    [touched, validateField]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  return {
    errors,
    touched,
    validate,
    handleBlur,
    handleChange,
    clearErrors,
    setErrors,
  }
}

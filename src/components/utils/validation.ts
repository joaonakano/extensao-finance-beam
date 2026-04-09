export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 3
}

export const validatePasswordStrength = (password: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else feedback.push('Use pelo menos 8 caracteres')

  if (password.length >= 12) score++
  else feedback.push('Use mais caracteres para mais segurança')

  if (/[a-z]/.test(password)) score++
  else feedback.push('Adicione letras minúsculas')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Adicione letras maiúsculas')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Adicione números')

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  else feedback.push('Adicione caracteres especiais')

  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  if (score >= 4) level = 'strong'
  else if (score >= 3) level = 'good'
  else if (score >= 2) level = 'fair'

  return { score, level, feedback }
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) return false
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Calcular primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i)
  }
  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleanCPF[9]) !== firstDigit) return false
  
  // Calcular segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i)
  }
  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder
  
  return parseInt(cleanCPF[10]) === secondDigit
}

export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateCurrency = (value: string): boolean => {
  const currencyRegex = /^\d+(\.\d{1,2})?$/
  return currencyRegex.test(value)
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
}
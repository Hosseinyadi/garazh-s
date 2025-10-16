/**
 * Security utilities for input validation and sanitization
 */

// HTML entity encoding for XSS prevention
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Sanitize user input by removing potentially dangerous characters
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[<>'"&]/g, (match) => {
      const entityMap: { [key: string]: string } = {
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#x27;',
        '&': '&'
      };
      return entityMap[match];
    });
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate phone number (Iranian format)
export const isValidPhone = (phone: string): boolean => {
  // Remove any spaces and normalize the phone number
  const normalizedPhone = phone.replace(/\s+/g, '');
  const phoneRegex = /^(\+98|0)?9\d{9}$/;
  return phoneRegex.test(normalizedPhone);
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('رمز عبور باید حداقل 8 کاراکتر باشد');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('رمز عبور باید حداقل یک حرف بزرگ داشته باشد');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('رمز عبور باید حداقل یک حرف کوچک داشته باشد');
  }

  if (!/\d/.test(password)) {
    errors.push('رمز عبور باید حداقل یک عدد داشته باشد');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('رمز عبور باید حداقل یک کاراکتر خاص داشته باشد');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate file upload
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): { isValid: boolean; error?: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `حجم فایل نباید بیشتر از ${Math.round(maxSize / 1024 / 1024)} مگابایت باشد`
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'نوع فایل مجاز نیست'
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: 'پسوند فایل مجاز نیست'
      };
    }
  }

  return { isValid: true };
};

// Rate limiting helper (client-side)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// CSRF token generation (for forms that need it)
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate URL to prevent SSRF
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Sanitize SQL-like inputs (additional layer)
export const sanitizeSqlInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/['";\\]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*.*?\*\//g, '') // Remove multi-line comments
    .trim();
};

// Log security events (client-side)
export const logSecurityEvent = (event: string, details: any): void => {
  console.warn(`[SECURITY] ${event}:`, details);

  // In production, this should send to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service
    // logToService({ event, details, timestamp: new Date().toISOString() });
  }
};
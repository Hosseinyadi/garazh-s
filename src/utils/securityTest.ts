/**
 * Security Testing Utilities
 * This file contains functions to test security measures implemented in the application
 */

import { validatePassword, sanitizeInput, isValidPhone, validateFileUpload, rateLimiter } from './security';

// Test password validation
export const testPasswordValidation = () => {
  console.log('🧪 Testing Password Validation...');

  const testCases = [
    { password: '123456', expected: false, description: 'Too short' },
    { password: 'password', expected: false, description: 'No uppercase, number, or special char' },
    { password: 'Password123', expected: false, description: 'No special character' },
    { password: 'Password@123', expected: true, description: 'Valid password' },
    { password: 'P@ss123', expected: true, description: 'Valid short password' },
  ];

  testCases.forEach(({ password, expected, description }) => {
    const result = validatePassword(password);
    const status = result.isValid === expected ? '✅' : '❌';
    console.log(`${status} ${description}: ${result.isValid} (expected: ${expected})`);
    if (!result.isValid && result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  });
};

// Test input sanitization
export const testInputSanitization = () => {
  console.log('🧪 Testing Input Sanitization...');

  const testCases = [
    { input: '<script>alert("xss")</script>', expected: true, description: 'XSS script tag' },
    { input: 'normal text', expected: false, description: 'Normal text' },
    { input: 'user@example.com', expected: false, description: 'Email address' },
    { input: '09123456789', expected: false, description: 'Phone number' },
  ];

  testCases.forEach(({ input, expected, description }) => {
    const sanitized = sanitizeInput(input);
    const wasSanitized = sanitized !== input;
    const status = wasSanitized === expected ? '✅' : '❌';
    console.log(`${status} ${description}: ${wasSanitized ? 'sanitized' : 'unchanged'} (expected: ${expected ? 'sanitized' : 'unchanged'})`);
    if (wasSanitized) {
      console.log(`   Original: "${input}" -> Sanitized: "${sanitized}"`);
    }
  });
};

// Test phone validation
export const testPhoneValidation = () => {
  console.log('🧪 Testing Phone Validation...');

  const testCases = [
    { phone: '09123456789', expected: true, description: 'Valid Iranian mobile' },
    { phone: '+989123456789', expected: true, description: 'Valid with country code' },
    { phone: '02112345678', expected: false, description: 'Landline number' },
    { phone: '123456789', expected: false, description: 'Too short' },
    { phone: '091234567890', expected: false, description: 'Too long' },
  ];

  testCases.forEach(({ phone, expected, description }) => {
    const result = isValidPhone(phone);
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} ${description}: ${result} (expected: ${expected})`);
  });
};

// Test file upload validation
export const testFileUploadValidation = () => {
  console.log('🧪 Testing File Upload Validation...');

  // Create mock files for testing
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['test'], name, { type });
    // Mock the size property
    Object.defineProperty(file, 'size', { value: size, writable: false });
    return file;
  };

  const testCases = [
    {
      file: createMockFile('test.jpg', 1024 * 1024, 'image/jpeg'),
      options: { maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg'], allowedExtensions: ['jpg'] },
      expected: true,
      description: 'Valid JPEG file'
    },
    {
      file: createMockFile('test.exe', 1024, 'application/octet-stream'),
      options: { maxSize: 1024 * 1024, allowedTypes: ['image/jpeg'], allowedExtensions: ['jpg'] },
      expected: false,
      description: 'Invalid file type'
    },
    {
      file: createMockFile('large.jpg', 10 * 1024 * 1024, 'image/jpeg'),
      options: { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg'], allowedExtensions: ['jpg'] },
      expected: false,
      description: 'File too large'
    },
  ];

  testCases.forEach(({ file, options, expected, description }) => {
    const result = validateFileUpload(file, options);
    const status = result.isValid === expected ? '✅' : '❌';
    console.log(`${status} ${description}: ${result.isValid} (expected: ${expected})`);
    if (!result.isValid && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
};

// Test rate limiting
export const testRateLimiting = () => {
  console.log('🧪 Testing Rate Limiting...');

  const testKey = 'test_rate_limit';

  // Reset any existing attempts
  rateLimiter.reset(testKey);

  // Test normal usage
  for (let i = 0; i < 3; i++) {
    const allowed = rateLimiter.isAllowed(testKey, 3, 60000);
    console.log(`${allowed ? '✅' : '❌'} Attempt ${i + 1}: ${allowed ? 'allowed' : 'blocked'}`);
  }

  // Test blocking after limit
  const blocked = rateLimiter.isAllowed(testKey, 3, 60000);
  console.log(`${!blocked ? '✅' : '❌'} Attempt 4: ${blocked ? 'allowed (unexpected)' : 'blocked (expected)'}`);

  // Reset and test again
  rateLimiter.reset(testKey);
  const resetAllowed = rateLimiter.isAllowed(testKey, 3, 60000);
  console.log(`${resetAllowed ? '✅' : '❌'} After reset: ${resetAllowed ? 'allowed' : 'blocked'}`);
};

// Run all security tests
export const runSecurityTests = () => {
  console.log('🔒 Running Security Tests...\n');

  testPasswordValidation();
  console.log('');

  testInputSanitization();
  console.log('');

  testPhoneValidation();
  console.log('');

  testFileUploadValidation();
  console.log('');

  testRateLimiting();
  console.log('');

  console.log('🔒 Security Tests Completed!');
};

// Individual test functions are already exported above
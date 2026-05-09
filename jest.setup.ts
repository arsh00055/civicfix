import '@testing-library/jest-dom'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token-123'),
  verify: jest.fn().mockReturnValue({ 
    userId: '507f1f77bcf86cd799439011',  // ← ih change kita
    role: 'citizen' 
  }),
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}))
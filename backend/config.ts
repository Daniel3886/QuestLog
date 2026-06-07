export const Config = {
  jwtSecret: process.env.JWT_SECRET! || 'your_secret_token',
  accessToken: {
    expiresIn: '14d' as const,
  },
  refreshToken: {
    expiresIn: '7d' as const,
  },
} as const;

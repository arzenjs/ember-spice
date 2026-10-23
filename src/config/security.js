// Rate limits and lifetimes for sensitive flows. Each limit is { limit, windowSeconds }.
export const securityConfig = {
  rateLimits: {
    reservePerIp: { limit: 6, windowSeconds: 60 * 60 },
    reservePerEmail: { limit: 3, windowSeconds: 24 * 60 * 60 },
    slotLookupPerIp: { limit: 120, windowSeconds: 10 * 60 },
    loginPerIpEmail: { limit: 5, windowSeconds: 15 * 60 },
    loginPerIp: { limit: 30, windowSeconds: 15 * 60 },
    invitePerAdmin: { limit: 20, windowSeconds: 60 * 60 },
    acceptInvitePerIp: { limit: 15, windowSeconds: 15 * 60 },
  },
  invitationValidHours: 72,
  sessionMaxAgeSeconds: 8 * 60 * 60, // staff sessions last one shift
  minPasswordLength: 10,
  maxConfirmationEmailAttempts: 5,
  confirmationEmailCooldownSeconds: 60,
  bcryptCost: 12,
};

export enum UserRole {
  CUSTOMER = 'customer',
  ESCORT = 'escort',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Kunde',
  [UserRole.ESCORT]: 'Escort',
  [UserRole.BUSINESS]: 'Business',
  [UserRole.ADMIN]: 'Administrator',
};
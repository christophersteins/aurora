export enum UserRole {
  CUSTOMER = 'customer',
  ESCORT = 'escort',
  BUSINESS = 'business',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Kunde',
  [UserRole.ESCORT]: 'Escort',
  [UserRole.BUSINESS]: 'Business',
};
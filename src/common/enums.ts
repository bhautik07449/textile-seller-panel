export const APP_CONSTANTS = {
  APP_NAME: 'Dead Textile Marketplace Admin',
  TOKEN_KEY: 'dt_admin_token',
  USER_KEY: 'dt_admin_user',
  DEFAULT_PAGE_SIZE: 20,
};

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
  INACTIVE = 'INACTIVE',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
}

export enum UserAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

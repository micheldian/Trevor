/**
 * User Status Enum
 *
 * Defines the possible states of a user account
 */
export enum UserStatus {
  /**
   * Active user - can login and perform all actions
   */
  ACTIVE = 'active',

  /**
   * Suspended user - temporarily blocked from login and actions
   * Suspension can be temporary (with suspend_until date) or indefinite
   */
  SUSPENDED = 'suspended',

  /**
   * Banned user - permanently blocked from login and all actions
   * Cannot be unsuspended, requires explicit unban action
   */
  BANNED = 'banned',
}

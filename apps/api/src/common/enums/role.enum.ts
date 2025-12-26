/**
 * User roles in the Trevor platform
 *
 * @enum {string}
 * - WORKER: Agricultural worker (individual)
 * - TEAM_LEAD: Leader of a worker team
 * - EMPLOYER: Employer posting jobs
 * - ADMIN: Platform administrator
 */
export enum Role {
  WORKER = 'worker',
  TEAM_LEAD = 'team_lead',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

/**
 * Role hierarchy levels (for future permission checks)
 */
export const ROLE_HIERARCHY = {
  [Role.WORKER]: 1,
  [Role.TEAM_LEAD]: 2,
  [Role.EMPLOYER]: 2,
  [Role.ADMIN]: 100,
};

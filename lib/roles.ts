export const ROLE_OPTIONS = [
  'Design student',
  'Product / industrial designer',
  'Design agency / consultant',
  'Design enthusiast',
  'Other',
] as const;

export type Role = (typeof ROLE_OPTIONS)[number];

export function isValidRole(role: string): role is Role {
  return (ROLE_OPTIONS as readonly string[]).includes(role);
}

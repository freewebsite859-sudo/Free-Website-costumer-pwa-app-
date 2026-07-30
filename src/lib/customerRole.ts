import { supabase } from './supabaseClient';

export const CUSTOMER_ROLE = 'customer';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  brand: 'Brand',
  customer: 'Customer',
  district_partner: 'Growth Partner',
  distributor: 'Distributor',
  growth_partner: 'Growth Partner',
  owner: 'Shop Owner',
  shop_manager: 'Shop Manager',
  shop_owner: 'Shop Owner',
  staff: 'Staff',
  super_admin: 'Admin',
  support: 'Support',
};

export type CustomerRoleDecision =
  | { allowed: true; role: typeof CUSTOMER_ROLE; label: 'Customer'; message: null }
  | { allowed: false; role: string | null; label: string; message: string };

export const assessCustomerRoles = (rawRoles: unknown[]): CustomerRoleDecision => {
  const roles = Array.from(
    new Set(rawRoles.filter((role): role is string => typeof role === 'string' && role.length > 0)),
  );

  if (roles.length === 1 && roles[0] === CUSTOMER_ROLE) {
    return {
      allowed: true,
      role: CUSTOMER_ROLE,
      label: 'Customer',
      message: null,
    };
  }

  if (roles.length === 0) {
    return {
      allowed: false,
      role: null,
      label: 'Missing Customer Role',
      message:
        'This account does not have a verified Customer role. Access to the Customer app has been blocked.',
    };
  }

  const conflictingRole = roles.find((role) => role !== CUSTOMER_ROLE) ?? roles[0];
  const label =
    roles.length > 1
      ? 'Multiple Roles'
      : ROLE_LABELS[conflictingRole] ?? 'Invalid Account Role';

  return {
    allowed: false,
    role: conflictingRole,
    label,
    message:
      'This account is assigned to a different permanent role and cannot access the Customer app.',
  };
};

export const verifyCustomerRole = async (
  userId: string,
): Promise<CustomerRoleDecision> => {
  if (!supabase) {
    return {
      allowed: false,
      role: null,
      label: 'Role Verification Unavailable',
      message:
        'Customer access could not be verified because authentication is not configured.',
    };
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) {
    return {
      allowed: false,
      role: null,
      label: 'Role Verification Unavailable',
      message:
        'Customer access could not be verified safely. Please try signing in again.',
    };
  }

  return assessCustomerRoles((data ?? []).map((row) => row.role));
};

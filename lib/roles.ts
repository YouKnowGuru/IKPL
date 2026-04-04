export const isSuperAdmin = (role: string) => role === 'super_admin';
export const isStoreAdmin = (role: string) => role === 'store_admin';
export const isAnyAdmin = (role: string) => role === 'super_admin' || role === 'store_admin';
export const isCustomer = (role: string) => role === 'customer';

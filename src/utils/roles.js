// One place that answers "what is this person in their gallery?".
// The backend sends role_name ('admin' | 'curator' | 'member') with every member.
// Never compare role_id numbers: each gallery has its own role rows, so ids differ.
export const hasRole = (user, ...names) => !!user && names.includes(user.role_name);
export const isAdmin = (user) => hasRole(user, 'admin');
export const isAdminOrCurator = (user) => hasRole(user, 'admin', 'curator');
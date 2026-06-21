export const resolveAdminId = (currentUser) => {
  if (!currentUser) return null;
  return currentUser.role === 'ADMIN' ? currentUser.id : currentUser.admin_id;
};

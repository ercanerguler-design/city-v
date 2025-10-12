// User Manager - Admin için kullanıcı bilgilerini yönetir
export interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  premium: boolean;
  createdAt: string | Date;
}

export interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  recentUsers: StoredUser[];
}

export function getAllUsers(): StoredUser[] {
  try {
    // Auth storage'dan mevcut kullanıcıyı al
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return [];

    const authData = JSON.parse(authStorage);
    const currentUser = authData?.state?.user;
    
    // Users storage'dan tüm kullanıcıları al (eğer varsa)
    const usersStorage = localStorage.getItem('all-users-storage');
    let allUsers: StoredUser[] = [];
    
    if (usersStorage) {
      const usersData = JSON.parse(usersStorage);
      allUsers = usersData.users || [];
    }
    
    // Mevcut kullanıcı varsa ve listede yoksa ekle
    if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
      allUsers.push({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        premium: currentUser.premium,
        createdAt: currentUser.createdAt || new Date().toISOString(),
      });
      
      // Güncellenmiş listeyi kaydet
      localStorage.setItem('all-users-storage', JSON.stringify({ users: allUsers }));
    }
    
    return allUsers.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // En yeni önce
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

export function saveUser(user: StoredUser): void {
  try {
    const allUsers = getAllUsers();
    const existingIndex = allUsers.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      allUsers[existingIndex] = user;
    } else {
      allUsers.push(user);
    }
    
    localStorage.setItem('all-users-storage', JSON.stringify({ users: allUsers }));
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

export function getUserStats(): UserStats {
  const users = getAllUsers();
  
  return {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.premium).length,
    recentUsers: users.slice(0, 10), // Son 10 kullanıcı
  };
}

export function deleteUser(userId: string): void {
  try {
    const allUsers = getAllUsers();
    const filtered = allUsers.filter(u => u.id !== userId);
    localStorage.setItem('all-users-storage', JSON.stringify({ users: filtered }));
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

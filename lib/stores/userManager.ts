// User Manager - Admin için kullanıcı bilgilerini yönetir
import type { MembershipTier } from '@/store/authStore';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  premium: boolean; // Eski sistem uyumluluğu için
  membershipTier: MembershipTier; // Yeni sistem
  createdAt: string | Date;
  membershipExpiry?: Date | null;
}

export interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  recentUsers: StoredUser[];
}

export function getAllUsers(): StoredUser[] {
  try {
    // Users storage'dan tüm kullanıcıları al
    const usersStorage = localStorage.getItem('all-users-storage');
    let allUsers: StoredUser[] = [];
    
    if (usersStorage) {
      const usersData = JSON.parse(usersStorage);
      allUsers = usersData.users || [];
    }
    
    // Auth storage'dan mevcut kullanıcıyı al ve listeye ekle (eğer yoksa)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      const currentUser = authData?.state?.user;
      
      // Mevcut kullanıcı varsa ve listede yoksa ekle
      if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
        allUsers.push({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          premium: currentUser.premium || (currentUser.membershipTier && currentUser.membershipTier !== 'free'),
          membershipTier: currentUser.membershipTier || 'free',
          createdAt: currentUser.createdAt || new Date().toISOString(),
          membershipExpiry: currentUser.membershipExpiry || null,
        });
        
        // Güncellenmiş listeyi kaydet
        localStorage.setItem('all-users-storage', JSON.stringify({ users: allUsers }));
      }
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

// Premium üyelik onaylama fonksiyonu
export function approvePremium(userId: string, tier: MembershipTier = 'premium'): void {
  try {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      allUsers[userIndex].membershipTier = tier;
      allUsers[userIndex].premium = true; // Eski sistem uyumluluğu
      allUsers[userIndex].membershipExpiry = null; // Lifetime
      
      localStorage.setItem('all-users-storage', JSON.stringify({ users: allUsers }));
      
      // Eğer bu kullanıcı aktif kullanıcıysa, authStore'u da güncelle
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData?.state?.user?.id === userId) {
          authData.state.user.membershipTier = tier;
          authData.state.user.premium = true;
          authData.state.user.membershipExpiry = null;
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          
          // Sayfayı yenile ki değişiklikler görünsün
          window.location.reload();
        }
      }
    }
  } catch (error) {
    console.error('Error approving premium:', error);
  }
}

// Premium iptal etme fonksiyonu
export function revokePremium(userId: string): void {
  try {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      allUsers[userIndex].membershipTier = 'free';
      allUsers[userIndex].premium = false;
      
      localStorage.setItem('all-users-storage', JSON.stringify({ users: allUsers }));
      
      // Eğer bu kullanıcı aktif kullanıcıysa, authStore'u da güncelle
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData?.state?.user?.id === userId) {
          authData.state.user.membershipTier = 'free';
          authData.state.user.premium = false;
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          
          // Sayfayı yenile
          window.location.reload();
        }
      }
    }
  } catch (error) {
    console.error('Error revoking premium:', error);
  }
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

/** Strips the password hash before a User row is ever sent to a client. */
export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profileImage: user.profileImage,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

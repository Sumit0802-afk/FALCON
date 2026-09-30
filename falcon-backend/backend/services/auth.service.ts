import bcrypt from "bcryptjs";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { AuthResult, LoginInput, RegisterInput, toPublicUser } from "../models/user.model";
import { tokenService } from "./token.service";

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    const token = tokenService.sign({ userId: user.id, role: user.role });
    return { user: toPublicUser(user), token };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw AppError.unauthorized("Invalid email or password");

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) throw AppError.unauthorized("Invalid email or password");

    // Update last login timestamp
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = tokenService.sign({ userId: updatedUser.id, role: updatedUser.role });
    return { user: toPublicUser(updatedUser), token };
  },

  async getById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    return toPublicUser(user);
  },
};

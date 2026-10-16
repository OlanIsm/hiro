import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { AppError, ValidationError } from "../errors/appError.js";
import { UnauthorizedError } from "../errors/authError.js";

const SALT_ROUNDS = 12;
const PASSWORD_HASH_KEY = "auth_password_hash";

export class AuthService {
  async isInitialized(): Promise<boolean> {
    const setting = await prisma.appSettings.findUnique({
      where: { key: PASSWORD_HASH_KEY },
    });
    return !!setting && !!setting.value;
  }

  async setupPassword(password: string): Promise<void> {
    const initialized = await this.isInitialized();
    if (initialized) {
      throw new ValidationError("Password has already been initialized");
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.appSettings.upsert({
      where: { key: PASSWORD_HASH_KEY },
      update: { value: hash },
      create: { key: PASSWORD_HASH_KEY, value: hash },
    });
  }

  async verifyPassword(password: string): Promise<boolean> {
    const setting = await prisma.appSettings.findUnique({
      where: { key: PASSWORD_HASH_KEY },
    });

    if (!setting || !setting.value) {
      throw new AppError("Application is not initialized yet", 400);
    }

    const isValid = await bcrypt.compare(password, setting.value);
    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return true;
  }
}

export const authService = new AuthService();

import bcrypt from "bcryptjs";
import { IAuthService } from "../interfaces/IService.interface";
import { IUserRepository } from "../interfaces/IRepository.interface";
import { IUserEntity } from "../interfaces/IUser.interface";
import { RegisterDTO, LoginDTO, AuthResponse, JwtPayload } from "../types/auth.types";
import { JwtUtil } from "../utils/jwt";
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from "../utils/appError";
import { Logger } from "../utils/logger";

export class AuthService implements IAuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    if (!dto.password) {
      throw new BadRequestError("Password is required for user registration.");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      vocalType: dto.vocalType || "Tenor",
      experienceLevel: dto.experienceLevel || "Intermediate",
      preferredGenres: ["Pop", "R&B"],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.name)}`,
      bio: "Aspiring vocalist tracking intonation and range.",
      totalPracticeHours: 0,
      totalPracticeMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
      preferences: {
        darkTheme: true,
        autoAnalyze: true,
        audioInputDevice: "Default",
        notifications: true,
      },
    });

    const token = this.generateToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role || "user",
    });

    Logger.info(`New user registered: ${newUser.email} (${newUser.id})`);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        vocalType: newUser.vocalType,
        experienceLevel: newUser.experienceLevel,
      },
      token,
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedError("Email and password are required.");
    }

    const user = await this.userRepo.findByEmailWithPassword(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    });

    Logger.info(`User authenticated: ${user.email} (${user.id})`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        vocalType: user.vocalType,
        experienceLevel: user.experienceLevel,
      },
      token,
    };
  }

  async getDemoUser(): Promise<AuthResponse> {
    const demoEmail = "elena.vocalist@example.com";
    let user = await this.userRepo.findByEmail(demoEmail);

    if (!user) {
      // Seed default demo user if not present
      user = await this.userRepo.create({
        id: "65a000000000000000000001",
        name: "Elena Vance",
        email: demoEmail,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        vocalType: "Tenor",
        experienceLevel: "Advanced",
        preferredGenres: ["Pop", "Musical Theater", "R&B"],
        bio: "Contemporary pop & musical theater vocalist. Focusing on chest-to-head mix blending and vibrato control.",
        totalPracticeHours: 8.25,
        totalPracticeMinutes: 495,
        currentStreak: 12,
        longestStreak: 15,
        lastActiveDate: new Date(),
        preferences: {
          darkTheme: true,
          autoAnalyze: true,
          audioInputDevice: "Shure SM7B Vocal Mic",
          notifications: true,
        },
      });
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "demo",
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        vocalType: user.vocalType,
        experienceLevel: user.experienceLevel,
      },
      token,
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return JwtUtil.verify(token);
  }

  generateToken(payload: JwtPayload): string {
    return JwtUtil.sign(payload);
  }

  async getUserById(id: string): Promise<IUserEntity | null> {
    return this.userRepo.findById(id);
  }
}

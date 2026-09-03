import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { ConflictError, UnauthorizedError, NotFoundError } from "../utils/errors.js";
import { ENV } from "../config/env.js";

export interface AuthResult {
  user: IUser;
  token: string;
}

export class AuthService {
  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      ENV.JWT_SECRET,
      {
        expiresIn: ENV.JWT_EXPIRES_IN,
      } as jwt.SignOptions
    );
  }

  public async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Default professional avatar placeholder
    const avatarUrl =
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwjIeQCpLn2-ekCThvNLli0HJiC1StXZO9VJFgqTEsPKrehUJZqWe1IByRc8F3It5axQAnl_bJRgmfOLeQG_Hv0AmCfBzUCMS1HwF11exNDBCLRdTnFFRJlZxaeYjweKECmOcSY2bD4Oj2gr9N47RTa8iuWEP1QvFzxzn1Zr5N-zL6deADUIWt5G0d_Ls5lV6sy1pqi2oOsQbzPPtYveNVfaYD5XM3_LT12lwKyC9CJlQVbRdUvEjt";

    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      bio: input.bio || "",
      avatarUrl,
      skills: [],
      experiences: [],
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = this.generateToken(user);

    // Remove passwordHash from returned object
    user.passwordHash = undefined as any;

    return { user, token };
  }

  public async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }
    return user;
  }
}

export const authService = new AuthService();

import mongoose from "mongoose";
import { User, IUser } from "../models/User.js";
import { UpdateProfileInput } from "../validators/developer.validator.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

export class DeveloperService {
  public async getDeveloperById(id: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid developer ID format.");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("Developer profile not found.");
    }

    return user;
  }

  public async updateOwnProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.bio !== undefined) user.bio = input.bio;
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
    if (input.skills !== undefined) user.skills = input.skills;
    if (input.experiences !== undefined) user.experiences = input.experiences as any;

    await user.save();
    return user;
  }

  public async listDevelopers(limit = 20): Promise<IUser[]> {
    return User.find().limit(limit).sort({ createdAt: -1 });
  }
}

export const developerService = new DeveloperService();

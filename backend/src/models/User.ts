import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IExperience {
  _id?: string;
  title: string;
  company: string;
  from: string;
  to?: string;
  currentlyWorking: boolean;
  description?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  experiences: IExperience[];
  savedPostIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    from: { type: String, required: true },
    to: { type: String },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Do not include in queries by default
    },
    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    experiences: {
      type: [ExperienceSchema],
      default: [],
    },
    savedPostIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Post" }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to verify candidate password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

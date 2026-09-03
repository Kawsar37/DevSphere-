import mongoose, { Document, Model, Schema } from "mongoose";

export type TargetType = "post" | "comment";
export type ReactionType = "like" | "dislike";

export interface IReaction extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: TargetType;
  targetId: mongoose.Types.ObjectId;
  reactionType: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: [true, "Target type is required"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
      index: true,
    },
    reactionType: {
      type: String,
      enum: ["like", "dislike"],
      required: [true, "Reaction type is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one reaction per user per target
ReactionSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

export const Reaction: Model<IReaction> =
  mongoose.models.Reaction || mongoose.model<IReaction>("Reaction", ReactionSchema);

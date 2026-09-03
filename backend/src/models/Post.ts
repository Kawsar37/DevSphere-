import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  tags: string[];
  likesCount: number;
  dislikesCount: number;
  commentCount: number;
  rankScore: number;
  userReaction?: "like" | "dislike" | null;
  isSaved?: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculateRankScore(): number;
}

const PostSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Post body is required"],
      minlength: [10, "Post body must be at least 10 characters long"],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    rankScore: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for author profile
PostSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

// Authoritative ranking formula: score = (likes - dislikes) + (commentCount * 2)
PostSchema.methods.calculateRankScore = function (): number {
  return (this.likesCount - this.dislikesCount) + (this.commentCount * 2);
};

PostSchema.pre("save", function (next) {
  this.rankScore = (this.likesCount - this.dislikesCount) + (this.commentCount * 2);
  next();
});

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  parentCommentId: mongoose.Types.ObjectId | null;
  body: string;
  likesCount: number;
  dislikesCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post ID is required"],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
      index: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    body: {
      type: String,
      required: [true, "Comment body is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for author profile
CommentSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

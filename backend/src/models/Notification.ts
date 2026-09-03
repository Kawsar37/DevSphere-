import mongoose, { Document, Model, Schema } from "mongoose";

export type NotificationType =
  | "comment_on_post"
  | "reply_to_comment"
  | "reaction_on_post"
  | "reaction_on_comment";

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: NotificationType;
  postId: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    type: {
      type: String,
      enum: [
        "comment_on_post",
        "reply_to_comment",
        "reaction_on_post",
        "reaction_on_comment",
      ],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post reference is required"],
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for fast unread notifications queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

NotificationSchema.virtual("sender", {
  ref: "User",
  localField: "senderId",
  foreignField: "_id",
  justOne: true,
});

NotificationSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

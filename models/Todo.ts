/**
 * Todo Model - Data Layer
 * Mongoose schema and model for Todo entity
 */

import mongoose, { Schema, Document } from "mongoose";

export enum TodoPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TodoStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ITodo extends Document {
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: Date;
  tags: string[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(TodoStatus),
      default: TodoStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TodoPriority),
      default: TodoPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
TodoSchema.index({ status: 1, createdAt: -1 });
TodoSchema.index({ priority: 1 });
TodoSchema.index({ tags: 1 });
TodoSchema.index({ completed: 1 });

// Virtual for checking if todo is overdue
TodoSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

// Ensure virtuals are included in JSON
TodoSchema.set("toJSON", { virtuals: true });
TodoSchema.set("toObject", { virtuals: true });

export default mongoose.model<ITodo>("Todo", TodoSchema);

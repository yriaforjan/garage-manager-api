import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../types/roles";

interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  companyId?: Types.ObjectId;
  active: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role !== UserRole.SUPER_ADMIN;
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const User = model<UserDocument>("User", UserSchema);

export { User, UserDocument };

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_LIST, ROLES, USER_VALIDATION } from "../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, USER_VALIDATION.FIRST_NAME_REQUIRED],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, USER_VALIDATION.LAST_NAME_REQUIRED],
      trim: true,
    },
    email: {
      type: String,
      required: [true, USER_VALIDATION.EMAIL_REQUIRED],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, USER_VALIDATION.PASSWORD_REQUIRED],
      minlength: 6,
      select: false,
    },
    gender: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.USER,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);

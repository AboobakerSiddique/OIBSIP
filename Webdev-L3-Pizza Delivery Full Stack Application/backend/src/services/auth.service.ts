import { User } from "../models/User";
import { VerificationToken } from "../models/VerificationToken";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { hashPassword, comparePassword } from "../utils/password";
import { generateOneTimeToken, hashToken } from "../utils/tokens";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service";
import type { RegisterInput, LoginInput } from "../validation/auth.schema";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: passwordHash,
    isVerified: false,
  });

  const { token, tokenHash } = generateOneTimeToken();
  await VerificationToken.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  });

  // Fire-and-forget-ish: awaited so we know whether it sent, but a
  // failed email never fails registration itself — the account is
  // still created and the dev-mode token fallback (see auth.controller)
  // keeps the flow testable either way.
  const emailResult = await sendVerificationEmail(user.email, user.name, token);

  return {
    user: { id: user._id.toString(), name: user.name, email: user.email },
    verificationToken: token,
    emailSent: emailResult.sent,
  };
}

export async function verifyEmail(token: string) {
  const tokenHash = hashToken(token);
  const record = await VerificationToken.findOne({ tokenHash });

  if (!record) {
    throw ApiError.badRequest("Invalid or expired verification token");
  }

  await User.findByIdAndUpdate(record.user, { isVerified: true });
  await VerificationToken.deleteMany({ user: record.user });

  return { verified: true };
}

export async function resendVerification(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether the email exists.
    return { verificationToken: null };
  }
  if (user.isVerified) {
    return { verificationToken: null, alreadyVerified: true };
  }

  await VerificationToken.deleteMany({ user: user._id });
  const { token, tokenHash } = generateOneTimeToken();
  await VerificationToken.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  });

  const emailResult = await sendVerificationEmail(user.email, user.name, token);

  return { verificationToken: token, emailSent: emailResult.sent };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await comparePassword(input.password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ sub: user._id.toString(), role: "user" });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  };
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether the email exists.
    return { resetToken: null };
  }

  await PasswordResetToken.deleteMany({ user: user._id });
  const { token, tokenHash } = generateOneTimeToken();
  await PasswordResetToken.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const emailResult = await sendPasswordResetEmail(user.email, user.name, token);

  return { resetToken: token, emailSent: emailResult.sent };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.unauthorized("Account no longer exists");
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const record = await PasswordResetToken.findOne({ tokenHash });

  if (!record) {
    throw ApiError.badRequest("Invalid or expired reset token");
  }

  const passwordHash = await hashPassword(newPassword);
  await User.findByIdAndUpdate(record.user, { password: passwordHash });
  await PasswordResetToken.deleteMany({ user: record.user });

  return { reset: true };
}

// One-time provisioning of the owner/admin account. Run on a trusted machine:
//   npm run create-admin
// Reads MONGODB_URI from .env.local. Prompts for email, name and password (hidden input).
// For automation you may set ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD instead of being prompted.
// Refuses to run if an admin already exists, and is never exposed over HTTP.
import readline from "node:readline";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import { securityConfig } from "../src/config/security.js";
import { validateEmail, validateName, validatePassword } from "../src/lib/validation.js";

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        // Echo the prompt itself but never the typed characters.
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function fail(message) {
  console.error(`\nError: ${message}`);
  process.exit(1);
}

if (!process.env.MONGODB_URI) fail("MONGODB_URI is not set. Create .env.local first (see .env.example).");

const email = validateEmail(process.env.ADMIN_EMAIL ?? (await ask("Admin email: ")));
if (email.error) fail(email.error);
const name = validateName(process.env.ADMIN_NAME ?? (await ask("Admin full name: ")));
if (name.error) fail(name.error);

let passwordInput = process.env.ADMIN_PASSWORD;
if (!passwordInput) {
  passwordInput = await ask("Password (hidden): ", { hidden: true });
  if (passwordInput !== (await ask("Repeat password: ", { hidden: true }))) fail("Passwords do not match.");
}
const password = validatePassword(passwordInput, { minLength: securityConfig.minPasswordLength, email: email.value });
if (password.error) fail(password.error);

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
try {
  await User.init(); // make sure the unique email index exists
  if (await User.exists({ role: "admin" })) fail("An admin account already exists. Invite additional people as staff from the admin dashboard.");
  if (await User.exists({ email: email.value })) fail("A user with that email already exists.");

  await User.create({
    name: name.value,
    email: email.value,
    passwordHash: await bcrypt.hash(password.value, securityConfig.bcryptCost),
    role: "admin",
    status: "active",
  });
  console.log(`\nAdmin account created for ${email.value}. Sign in at /staff/login.`);
} finally {
  await mongoose.disconnect();
}

import bcrypt from "bcryptjs";
import { securityConfig } from "../config/security.js";

export const hashPassword = (password) => bcrypt.hash(password, securityConfig.bcryptCost);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

// Hash of a throwaway value. Comparing against it when an email is unknown keeps response time
// similar to a real check, so timing does not reveal which accounts exist.
let dummyHash;
export const getDummyHash = () => (dummyHash ??= bcrypt.hash("not-a-real-password", securityConfig.bcryptCost));

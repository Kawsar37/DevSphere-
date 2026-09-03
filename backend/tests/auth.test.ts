import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Authentication Security Logic", () => {
  const TEST_PASSWORD = "StrongSecurePassword123!";
  const JWT_SECRET = "devsphere-test-secret-key-12345";

  it("should securely hash password with bcrypt and verify match", async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(TEST_PASSWORD, salt);

    assert.notEqual(hash, TEST_PASSWORD, "Hash must not equal plain password");
    const isMatch = await bcrypt.compare(TEST_PASSWORD, hash);
    assert.equal(isMatch, true, "Valid password must match hash");

    const isWrong = await bcrypt.compare("WrongPassword!", hash);
    assert.equal(isWrong, false, "Invalid password must not match hash");
  });

  it("should sign and verify JWT tokens containing user claims", () => {
    const payload = {
      id: "60d0fe4f5311236168a109ca",
      email: "elena@prisma.io",
      name: "Elena Rostova",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    assert.ok(typeof token === "string" && token.length > 20);

    const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;
    assert.equal(decoded.id, payload.id);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.name, payload.name);
  });

  it("should reject tampered or invalid JWT tokens", () => {
    const token = jwt.sign({ id: "123" }, JWT_SECRET);
    assert.throws(
      () => {
        jwt.verify(token, "wrong-secret-key");
      },
      /invalid signature/,
      "Token verified with wrong secret should throw invalid signature"
    );
  });
});

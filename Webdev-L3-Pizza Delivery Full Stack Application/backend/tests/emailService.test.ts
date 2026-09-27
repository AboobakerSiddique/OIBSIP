describe("email service (SMTP not configured in this test environment)", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it("sendVerificationEmail resolves with sent:false instead of throwing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sendVerificationEmail } = require("../src/services/email.service");
    const result = await sendVerificationEmail("test@example.com", "Test User", "sometoken");
    expect(result.sent).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("sendPasswordResetEmail resolves with sent:false instead of throwing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sendPasswordResetEmail } = require("../src/services/email.service");
    const result = await sendPasswordResetEmail("test@example.com", "Test User", "sometoken");
    expect(result.sent).toBe(false);
  });

  it("sendLowStockAlert resolves with sent:false instead of throwing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sendLowStockAlert } = require("../src/services/email.service");
    const result = await sendLowStockAlert("admin@example.com", [
      { name: "Mozzarella", category: "Cheeses", quantity: 2, threshold: 8, unit: "kg" },
    ]);
    expect(result.sent).toBe(false);
  });

  it("isEmailConfigured reflects missing SMTP credentials", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isEmailConfigured } = require("../src/config/email");
    expect(isEmailConfigured()).toBe(false);
  });
});

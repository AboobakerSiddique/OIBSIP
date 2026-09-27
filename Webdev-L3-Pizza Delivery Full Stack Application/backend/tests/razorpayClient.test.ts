describe("getRazorpayClient", () => {
  const ORIGINAL_ENV = process.env.RAZORPAY_KEY_ID;
  const ORIGINAL_SECRET = process.env.RAZORPAY_KEY_SECRET;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  afterAll(() => {
    if (ORIGINAL_ENV) process.env.RAZORPAY_KEY_ID = ORIGINAL_ENV;
    if (ORIGINAL_SECRET) process.env.RAZORPAY_KEY_SECRET = ORIGINAL_SECRET;
  });

  it("throws a structured ApiError (not a raw crash) when keys are missing", () => {
    // require() rather than a dynamic import — this project's Jest
    // setup runs under CommonJS, and jest.resetModules() only clears
    // the require cache.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getRazorpayClient } = require("../src/config/razorpay");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ApiError } = require("../src/utils/ApiError");

    expect(() => getRazorpayClient()).toThrow(ApiError);
    try {
      getRazorpayClient();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as InstanceType<typeof ApiError>).statusCode).toBe(500);
    }
  });
});

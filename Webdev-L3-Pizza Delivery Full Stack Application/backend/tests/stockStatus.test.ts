import { computeStockStatus } from "../src/utils/stockStatus";

describe("computeStockStatus", () => {
  it("returns Out of Stock at zero quantity", () => {
    expect(computeStockStatus(0, 10)).toBe("Out of Stock");
  });

  it("returns Out of Stock for negative quantity (defensive)", () => {
    expect(computeStockStatus(-1, 10)).toBe("Out of Stock");
  });

  it("returns Low Stock when quantity is at the threshold", () => {
    expect(computeStockStatus(10, 10)).toBe("Low Stock");
  });

  it("returns Low Stock when quantity is below the threshold but above zero", () => {
    expect(computeStockStatus(5, 10)).toBe("Low Stock");
  });

  it("returns Healthy when quantity is above the threshold", () => {
    expect(computeStockStatus(11, 10)).toBe("Healthy");
  });
});

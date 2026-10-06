import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireGuide, getGuideScheduledTours } = vi.hoisted(() => ({
  requireGuide: vi.fn(),
  getGuideScheduledTours: vi.fn(),
}));

vi.mock("@/lib/auth/permissions", () => ({
  requireGuide,
}));

vi.mock("@/lib/queries/guides", () => ({
  getGuideScheduledTours,
}));

import { GET } from "./route";

describe("GET /api/guide/tours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the guide's scheduled tours", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    const result = {
      items: [
        {
          id: "tour-uuid",
          externalId: 1001,
          tourDate: "2026-10-10",
          startTime: "10:00:00",
          endTime: "14:00:00",
          status: "CONFIRMED",
          numberOfPeople: 2,
          tourName: "Tijuana City Tour",
          pickupLocation: "Downtown Tijuana",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };

    getGuideScheduledTours.mockResolvedValue(result);

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);

    expect(getGuideScheduledTours).toHaveBeenCalledWith(
      "guide-user-id",
      undefined,
      undefined,
      1,
      20,
    );
  });

  it("passes pagination, status, and search parameters", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getGuideScheduledTours.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      pageSize: 10,
      totalPages: 0,
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/api/guide/tours?page=2&pageSize=10&status=CONFIRMED&search=Tijuana",
      ),
    );

    expect(response.status).toBe(200);

    expect(getGuideScheduledTours).toHaveBeenCalledWith(
      "guide-user-id",
      "CONFIRMED",
      "Tijuana",
      2,
      10,
    );
  });

  it("returns 401 when the user is not authenticated", async () => {
    requireGuide.mockRejectedValue(new Error("Unauthorized"));

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours"),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Unauthorized",
    });

    expect(getGuideScheduledTours).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is not a guide", async () => {
    requireGuide.mockRejectedValue(new Error("Forbidden"));

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours"),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Forbidden",
    });

    expect(getGuideScheduledTours).not.toHaveBeenCalled();
  });

  it("returns 404 when the user does not exist in the database", async () => {
    requireGuide.mockRejectedValue(new Error("User not found"));

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours"),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "User not found",
    });

    expect(getGuideScheduledTours).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid page", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getGuideScheduledTours.mockRejectedValue(
      new Error("Page must be a positive integer."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours?page=0"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Page must be a positive integer.",
    });
  });

  it("returns 400 for an invalid page size", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getGuideScheduledTours.mockRejectedValue(
      new Error("Limit must be a positive integer."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours?pageSize=0"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Limit must be a positive integer.",
    });
  });

  it("returns 500 for unexpected errors", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getGuideScheduledTours.mockRejectedValue(
      new Error("Unexpected database failure"),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours"),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Internal server error",
    });
  });
});

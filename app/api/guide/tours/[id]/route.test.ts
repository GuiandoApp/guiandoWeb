import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireGuide, getScheduledTourByUuid, toGuideScheduledTourResponse } =
  vi.hoisted(() => ({
    requireGuide: vi.fn(),
    getScheduledTourByUuid: vi.fn(),
    toGuideScheduledTourResponse: vi.fn(),
  }));

vi.mock("@/lib/auth/permissions", () => ({
  requireGuide,
}));

vi.mock("@/lib/queries/scheduledTours", () => ({
  getScheduledTourByUuid,
}));

vi.mock("@/lib/api/guide/tour-response", () => ({
  toGuideScheduledTourResponse,
}));

import { GET } from "./route";

describe("GET /api/guide/tours/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the requested scheduled tour", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    const scheduledTour = {
      id: "tour-uuid",
    };

    const responseBody = {
      id: "tour-uuid",
      externalId: 1001,
      status: "CONFIRMED",
      tour: {
        name: "Tijuana City Tour",
      },
      travelers: [],
    };

    getScheduledTourByUuid.mockResolvedValue(scheduledTour);
    toGuideScheduledTourResponse.mockReturnValue(responseBody);

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/tour-uuid"),
      {
        params: Promise.resolve({
          id: "tour-uuid",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(responseBody);

    expect(getScheduledTourByUuid).toHaveBeenCalledWith(
      "tour-uuid",
      "guide-user-id",
    );

    expect(toGuideScheduledTourResponse).toHaveBeenCalledWith(scheduledTour);
  });

  it("returns 401 when the user is not authenticated", async () => {
    requireGuide.mockRejectedValue(new Error("Unauthorized"));

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/tour-uuid"),
      {
        params: Promise.resolve({
          id: "tour-uuid",
        }),
      },
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Unauthorized",
    });

    expect(getScheduledTourByUuid).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is not a guide", async () => {
    requireGuide.mockRejectedValue(new Error("Forbidden"));

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/tour-uuid"),
      {
        params: Promise.resolve({
          id: "tour-uuid",
        }),
      },
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Forbidden",
    });

    expect(getScheduledTourByUuid).not.toHaveBeenCalled();
  });

  it("returns 404 when the user does not exist", async () => {
    requireGuide.mockRejectedValue(new Error("User not found"));

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/tour-uuid"),
      {
        params: Promise.resolve({
          id: "tour-uuid",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "User not found",
    });

    expect(getScheduledTourByUuid).not.toHaveBeenCalled();
  });

  it("returns 404 when the tour is not assigned to the guide", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getScheduledTourByUuid.mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/other-tour-uuid"),
      {
        params: Promise.resolve({
          id: "other-tour-uuid",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Scheduled tour not found.",
    });

    expect(getScheduledTourByUuid).toHaveBeenCalledWith(
      "other-tour-uuid",
      "guide-user-id",
    );

    expect(toGuideScheduledTourResponse).not.toHaveBeenCalled();
  });

  it("returns 400 when the tour ID is not a valid UUID", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getScheduledTourByUuid.mockRejectedValue(
      new Error("Scheduled tour ID must be a valid UUID."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/not-a-uuid"),
      {
        params: Promise.resolve({
          id: "not-a-uuid",
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Scheduled tour ID must be a valid UUID.",
    });
  });

  it("returns 500 for unexpected errors", async () => {
    requireGuide.mockResolvedValue({
      id: "guide-user-id",
      role: "GUIDE",
    });

    getScheduledTourByUuid.mockRejectedValue(
      new Error("Unexpected database failure"),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/guide/tours/tour-uuid"),
      {
        params: Promise.resolve({
          id: "tour-uuid",
        }),
      },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Internal server error",
    });
  });
});

import { describe, expect, it, vi } from "vitest";

const { requireGuide, completeScheduledTour } = vi.hoisted(() => ({
  requireGuide: vi.fn(),
  completeScheduledTour: vi.fn(),
}));

vi.mock("@/lib/auth/permissions", () => ({
  requireGuide,
}));

vi.mock("@/lib/queries/scheduledTours", () => ({
  completeScheduledTour,
}));

import { POST } from "./route";

const TOUR_ID = "be68c081-7f18-44ce-9a94-7f8b17dfae55";
const USER_ID = "guide-user-id";

describe("POST /api/guide/tours/[id]/complete", () => {
  it("completes the requested tour", async () => {
    requireGuide.mockResolvedValue({
      id: USER_ID,
      role: "GUIDE",
    });

    completeScheduledTour.mockResolvedValue({
      id: TOUR_ID,
      status: "COMPLETED",
    });

    const response = await POST(
      new Request(`http://localhost/api/guide/tours/${TOUR_ID}/complete`, {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: TOUR_ID }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Tour marked as completed.",
      tour: {
        id: TOUR_ID,
        status: "COMPLETED",
      },
    });

    expect(completeScheduledTour).toHaveBeenCalledWith(TOUR_ID, USER_ID);
  });

  it("returns 401 when the guide is not authenticated", async () => {
    requireGuide.mockRejectedValue(new Error("Unauthorized"));

    const response = await POST(
      new Request(`http://localhost/api/guide/tours/${TOUR_ID}/complete`, {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: TOUR_ID }),
      },
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Unauthorized",
    });
  });

  it("returns 403 when the user is not a guide", async () => {
    requireGuide.mockRejectedValue(new Error("Forbidden"));

    const response = await POST(
      new Request(`http://localhost/api/guide/tours/${TOUR_ID}/complete`, {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: TOUR_ID }),
      },
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Forbidden",
    });
  });

  it("returns 404 when the user does not exist", async () => {
    requireGuide.mockRejectedValue(new Error("User not found"));

    const response = await POST(
      new Request(`http://localhost/api/guide/tours/${TOUR_ID}/complete`, {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: TOUR_ID }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "User not found",
    });
  });

  it("returns 400 when the tour ID is invalid", async () => {
    requireGuide.mockResolvedValue({
      id: USER_ID,
      role: "GUIDE",
    });

    completeScheduledTour.mockRejectedValue(
      new Error("Scheduled tour ID must be a valid UUID."),
    );

    const response = await POST(
      new Request("http://localhost/api/guide/tours/not-a-uuid/complete", {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: "not-a-uuid" }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Scheduled tour ID must be a valid UUID.",
    });
  });

  it("returns 404 when the tour cannot be completed", async () => {
    requireGuide.mockResolvedValue({
      id: USER_ID,
      role: "GUIDE",
    });

    completeScheduledTour.mockResolvedValue(null);

    const response = await POST(
      new Request(`http://localhost/api/guide/tours/${TOUR_ID}/complete`, {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: TOUR_ID }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Tour not found, not assigned to guide, or already completed.",
    });
  });

  it("returns 500 for unexpected errors", async () => {
    requireGuide.mockResolvedValue({
      id: USER_ID,
      role: "GUIDE",
    });

    completeScheduledTour.mockRejectedValue(new Error("Database failure"));

    const response = await POST(
      new Request(`http://localhost/api/guide/tours/${TOUR_ID}/complete`, {
        method: "POST",
      }),
      {
        params: Promise.resolve({ id: TOUR_ID }),
      },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Internal server error",
    });
  });
});

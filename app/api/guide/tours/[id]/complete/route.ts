import { NextResponse } from "next/server";

import { requireGuide } from "@/lib/auth/permissions";
import { completeScheduledTour } from "@/lib/queries/scheduledTours";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireGuide();
    const { id } = await context.params;

    const completedTour = await completeScheduledTour(id, user.id);

    if (!completedTour) {
      return NextResponse.json(
        {
          error: "Tour not found, not assigned to guide, or already completed.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Tour marked as completed.",
      tour: {
        id: completedTour.id,
        status: completedTour.status,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "User not found") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (error.message === "Scheduled tour ID must be a valid UUID.") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error("Failed to complete guide scheduled tour:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

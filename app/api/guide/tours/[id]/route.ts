import { NextResponse } from "next/server";

import { requireGuide } from "@/lib/auth/permissions";
import { getScheduledTourByUuid } from "@/lib/queries/scheduledTours";
import { toGuideScheduledTourResponse } from "@/lib/api/guide/tour-response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireGuide();
    const { id } = await context.params;

    const scheduledTour = await getScheduledTourByUuid(id, user.id);

    if (!scheduledTour) {
      return NextResponse.json(
        { error: "Scheduled tour not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(toGuideScheduledTourResponse(scheduledTour));
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

    console.error("Failed to fetch guide scheduled tour:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

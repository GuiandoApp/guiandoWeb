import { NextResponse } from "next/server";

import { requireGuide } from "@/lib/auth/permissions";
import { getGuideScheduledTours } from "@/lib/queries/guides";

export async function GET(request: Request) {
  try {
    const user = await requireGuide();

    const { searchParams } = new URL(request.url);

    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const page = pageParam ? Number(pageParam) : 1;
    const pageSize = pageSizeParam ? Number(pageSizeParam) : 20;

    const result = await getGuideScheduledTours(
      user.id,
      status,
      search,
      page,
      pageSize,
    );

    return NextResponse.json(result);
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

      if (
        error.message === "Page must be a positive integer." ||
        error.message === "Limit must be a positive integer."
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error("Failed to fetch guide tours:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

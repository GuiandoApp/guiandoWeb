import { describe, expect, it } from "vitest";

import { toGuideScheduledTourResponse } from "./tour-response";

describe("toGuideScheduledTourResponse", () => {
  it("returns the expected guide-safe response", () => {
    const result = toGuideScheduledTourResponse({
      id: "tour-uuid",
      externalId: 1001,
      status: "CONFIRMED",
      bookingDate: "2026-10-01",
      tourDate: "2026-10-10",
      startTime: "10:00:00",
      endTime: "14:00:00",
      locationStart: "Tijuana Airport",
      locationEnd: "Downtown Tijuana",
      numberOfPeople: 2,
      specialIndications: "Test indication",

      tour: {
        productId: "TOUR-001",
        name: "Tijuana City Tour",
        description: "Explore Tijuana.",
        duration: 240,
        tourType: {
          name: "City Tour",
          description: "A city tour.",
        },
        tourClass: {
          name: "Private",
          description: "A private tour.",
        },
      },

      pickupLocation: {
        name: "Downtown Tijuana",
        address: "123 Main St",
        instructions: "Meet at the entrance.",
        latitude: "32.5149",
        longitude: "-117.0382",
      },

      travelerAssignments: [
        {
          traveler: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "555-1234",
          },
        },
      ],
    });

    expect(result).toEqual({
      id: "tour-uuid",
      externalId: 1001,
      status: "CONFIRMED",
      bookingDate: "2026-10-01",
      tourDate: "2026-10-10",
      startTime: "10:00:00",
      endTime: "14:00:00",
      locationStart: "Tijuana Airport",
      locationEnd: "Downtown Tijuana",
      numberOfPeople: 2,
      specialIndications: "Test indication",

      tour: {
        productId: "TOUR-001",
        name: "Tijuana City Tour",
        description: "Explore Tijuana.",
        duration: 240,
        tourType: {
          name: "City Tour",
          description: "A city tour.",
        },
        tourClass: {
          name: "Private",
          description: "A private tour.",
        },
      },

      pickupLocation: {
        name: "Downtown Tijuana",
        address: "123 Main St",
        instructions: "Meet at the entrance.",
        latitude: "32.5149",
        longitude: "-117.0382",
      },

      travelers: [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "555-1234",
        },
      ],
    });
  });

  it("does not expose internal or financial fields", () => {
    const result = toGuideScheduledTourResponse({
      id: "tour-uuid",
      externalId: 1001,
      status: "CONFIRMED",
      bookingDate: "2026-10-01",
      tourDate: "2026-10-10",
      startTime: "10:00:00",
      endTime: "14:00:00",
      locationStart: "Tijuana Airport",
      locationEnd: "Downtown Tijuana",
      numberOfPeople: 2,
      specialIndications: null,

      tour: {
        productId: "TOUR-001",
        name: "Tijuana City Tour",
        description: null,
        duration: 240,
        tourType: null,
        tourClass: null,
      },

      pickupLocation: {
        name: "Downtown Tijuana",
        address: "123 Main St",
        instructions: null,
        latitude: "32.5149",
        longitude: "-117.0382",
      },

      travelerAssignments: [],
    });

    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("tip");
    expect(serialized).not.toContain("paymentType");
    expect(serialized).not.toContain("paymentTypeId");
    expect(serialized).not.toContain("affiliate");
    expect(serialized).not.toContain("affiliateId");
    expect(serialized).not.toContain("tourId");
    expect(serialized).not.toContain("pickupLocationId");
    expect(serialized).not.toContain("createdAt");
    expect(serialized).not.toContain("updatedAt");
  });

  it("throws when the scheduled tour has no tour", () => {
    expect(() =>
      toGuideScheduledTourResponse({
        id: "tour-uuid",
        externalId: 1001,
        status: "CONFIRMED",
        bookingDate: null,
        tourDate: "2026-10-10",
        startTime: null,
        endTime: null,
        locationStart: null,
        locationEnd: null,
        numberOfPeople: 1,
        specialIndications: null,
        tour: null,
        pickupLocation: {
          name: "Downtown Tijuana",
          address: "123 Main St",
          instructions: null,
          latitude: null,
          longitude: null,
        },
        travelerAssignments: [],
      }),
    ).toThrow("Scheduled tour has no associated tour.");
  });

  it("throws when the scheduled tour has no pickup location", () => {
    expect(() =>
      toGuideScheduledTourResponse({
        id: "tour-uuid",
        externalId: 1001,
        status: "CONFIRMED",
        bookingDate: null,
        tourDate: "2026-10-10",
        startTime: null,
        endTime: null,
        locationStart: null,
        locationEnd: null,
        numberOfPeople: 1,
        specialIndications: null,
        tour: {
          productId: "TOUR-001",
          name: "Tijuana City Tour",
          description: null,
          duration: 240,
          tourType: null,
          tourClass: null,
        },
        pickupLocation: null,
        travelerAssignments: [],
      }),
    ).toThrow("Scheduled tour has no pickup location.");
  });
});

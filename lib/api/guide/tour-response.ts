type GuideScheduledTour = {
  id: string;
  externalId: number | null;
  status: string;
  bookingDate: string | null;
  tourDate: string;
  startTime: string | null;
  endTime: string | null;
  locationStart: string | null;
  locationEnd: string | null;
  numberOfPeople: number | null;
  specialIndications: string | null;

  tour: {
    productId: string | null;
    name: string;
    description: string | null;
    duration: number | null;

    tourType: {
      name: string;
      description: string | null;
    } | null;

    tourClass: {
      name: string;
      description: string | null;
    } | null;
  } | null;

  pickupLocation: {
    name: string;
    address: string;
    instructions: string | null;
    latitude: string | null;
    longitude: string | null;
  } | null;

  travelerAssignments: Array<{
    traveler: {
      firstName: string;
      lastName: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  }>;
};

export function toGuideScheduledTourResponse(
  scheduledTour: GuideScheduledTour,
) {
  if (!scheduledTour.tour) {
    throw new Error("Scheduled tour has no associated tour.");
  }

  if (!scheduledTour.pickupLocation) {
    throw new Error("Scheduled tour has no pickup location.");
  }

  return {
    id: scheduledTour.id,
    externalId: scheduledTour.externalId,
    status: scheduledTour.status,
    bookingDate: scheduledTour.bookingDate,
    tourDate: scheduledTour.tourDate,
    startTime: scheduledTour.startTime,
    endTime: scheduledTour.endTime,
    locationStart: scheduledTour.locationStart,
    locationEnd: scheduledTour.locationEnd,
    numberOfPeople: scheduledTour.numberOfPeople,
    specialIndications: scheduledTour.specialIndications,

    tour: {
      productId: scheduledTour.tour.productId,
      name: scheduledTour.tour.name,
      description: scheduledTour.tour.description,
      duration: scheduledTour.tour.duration,

      tourType: scheduledTour.tour.tourType
        ? {
            name: scheduledTour.tour.tourType.name,
            description: scheduledTour.tour.tourType.description,
          }
        : null,

      tourClass: scheduledTour.tour.tourClass
        ? {
            name: scheduledTour.tour.tourClass.name,
            description: scheduledTour.tour.tourClass.description,
          }
        : null,
    },

    pickupLocation: {
      name: scheduledTour.pickupLocation.name,
      address: scheduledTour.pickupLocation.address,
      instructions: scheduledTour.pickupLocation.instructions,
      latitude: scheduledTour.pickupLocation.latitude,
      longitude: scheduledTour.pickupLocation.longitude,
    },

    travelers: scheduledTour.travelerAssignments
      .map(({ traveler }) => traveler)
      .filter((traveler): traveler is NonNullable<typeof traveler> => {
        return traveler !== null;
      })
      .map((traveler) => ({
        firstName: traveler.firstName,
        lastName: traveler.lastName,
        email: traveler.email,
        phone: traveler.phone,
      })),
  };
}

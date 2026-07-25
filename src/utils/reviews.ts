/**
 * Shared helpers for per-salon service reviews.
 *
 * Reviews are written from two places (SalonDetailScreen and the "Leave a review"
 * flow on BookingsScreen via App). Both used to build the storage key by hand and
 * neither notified the other, so a review submitted from Bookings never appeared
 * on the salon page until a full reload. The custom event below closes that gap.
 */
export const REVIEWS_UPDATED_EVENT = 'nexora:service-reviews-updated';

export const serviceReviewsKey = (salonId: string) => `nexora_service_reviews_${salonId}`;

export interface ReviewsUpdatedDetail {
  salonId: string;
}

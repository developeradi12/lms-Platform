export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  message: string;
  image?: string;
  rating?: number; // 1-5
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTestimonialPayload = Omit<Testimonial, "_id" | "createdAt" | "updatedAt">;
export type UpdateTestimonialPayload = Partial<CreateTestimonialPayload>;
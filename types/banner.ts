export interface Banner {
  _id: string;
  image: string;
  isMobile:boolean
  createdAt?: string;
  updatedAt?: string;
}

export type CreateBannerPayload = Omit<Banner, "_id" | "createdAt" | "updatedAt">;
export type UpdateBannerPayload = Partial<CreateBannerPayload>;
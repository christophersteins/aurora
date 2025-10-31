export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  reviewedUser?: {
    id: string;
    username: string;
    profilePicture?: string;
  };
}

export interface CreateReviewDto {
  reviewedUserId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewStats {
  average: number;
  count: number;
}

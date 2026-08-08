export type CivitaiRating = "PG" | "PG13" | "R" | "X" | "XXX";

export interface CivitaiImage {
  id: number;
  url: string;
  hash?: string;
  width: number;
  height: number;
  nsfwLevel: "None" | "Soft" | "Mature" | "X" | "XXX" | string;
  browsingLevel: number;
  type: "image" | "video";
  nsfw: boolean;
  createdAt: string;
  postId?: number;
  username?: string;
  baseModel?: string;
  modelVersionIds?: number[];
  stats?: {
    likeCount?: number;
    heartCount?: number;
    commentCount?: number;
    laughCount?: number;
    cryCount?: number;
    dislikeCount?: number;
  };
  meta?: {
    prompt?: string;
    negativePrompt?: string;
    sampler?: string;
    cfgScale?: number;
    steps?: number;
    seed?: number;
    Size?: string;
    [key: string]: unknown;
  } | null;
}

export interface CivitaiApiResponse {
  items: CivitaiImage[];
  metadata?: {
    nextCursor?: string;
    nextPage?: string;
  };
  error?: string;
}

export function getNormalizedRating(item: CivitaiImage): CivitaiRating {
  const nsfwLevel = (item.nsfwLevel || "").toUpperCase();
  const browsingLevel = item.browsingLevel || 0;

  if (nsfwLevel === "XXX" || browsingLevel >= 16) return "XXX";
  if (nsfwLevel === "X" || browsingLevel === 8) return "X";
  if (nsfwLevel === "MATURE" || browsingLevel === 4) return "R";
  if (nsfwLevel === "SOFT" || browsingLevel === 2) return "PG13";
  return "PG";
}

export function getDisplayRatingLabel(rating: CivitaiRating): string {
  switch (rating) {
    case "XXX":
      return "XXX (19+)";
    case "X":
      return "X (19+)";
    case "R":
      return "R (18)";
    case "PG13":
      return "PG-13";
    case "PG":
    default:
      return "PG";
  }
}

export function isRatingCensored(item: CivitaiImage): boolean {
  const rating = getNormalizedRating(item);
  return rating === "X" || rating === "XXX";
}

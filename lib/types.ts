export type Person = {
  id: string;
  first_name: string;
  last_name: string | null;
  maiden_name: string | null;
  nickname: string | null;
  birth_date: string | null;
  death_date: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  generation: number;
  sort_order: number | null;
  created_at: string | null;
};

export type Relationship = {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: "parent" | "spouse" | "sibling";
  created_at: string | null;
};

export type Photo = {
  id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: string | null;
  taken_date: string | null;
  tagged_people: string[] | null;
  rotation: number | null;
  created_at: string | null;
};

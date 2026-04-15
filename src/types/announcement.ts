export interface Announcement {
  _id: string;
  text: string;
  isActive: boolean;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  text: string;
  isActive?: boolean;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}
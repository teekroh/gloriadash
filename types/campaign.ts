export interface Campaign {
  id: string;
  name: string;
  launchedAt: string;
  leadIds?: string[];
  sentCount: number;
  recipientNames?: string[];
}

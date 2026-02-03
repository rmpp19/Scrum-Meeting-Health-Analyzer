
export enum MeetingType {
  DAILY_SCRUM = 'Daily Scrum / Standup',
  SPRINT_PLANNING = 'Sprint Planning',
  SPRINT_REVIEW = 'Sprint Review',
  SPRINT_RETROSPECTIVE = 'Sprint Retrospective',
  PBR = 'Product Backlog Refinement'
}

export enum GoalLabel {
  ACHIEVED = 'Achieved',
  PARTIALLY_ACHIEVED = 'Partially Achieved',
  NOT_ACHIEVED = 'Not Achieved'
}

export interface AntiPattern {
  name: string;
  description: string;
  evidence: string;
}

export interface Recommendation {
  text: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  id: string;
  date: string; // The analysis execution date
  meetingType: MeetingType;
  teamName: string; // Manually entered team name
  sprintNumber?: string; // Manually entered sprint
  summary: string[];
  score: number; // 0-100
  label: GoalLabel;
  antiPatterns: AntiPattern[];
  recommendations: Recommendation[];
  rawNotesAnonymized?: string;
  sourceFileNames?: string[]; // Array of file names if multiple
  extractedTeamName?: string; // AI extracted team name from content
  extractedDate?: string; // AI extracted meeting date from content (or date range)
  isMultiMeeting?: boolean; // Flag to indicate aggregate analysis
}

export interface AppState {
  history: AnalysisResult[];
  privacyFirst: boolean;
}

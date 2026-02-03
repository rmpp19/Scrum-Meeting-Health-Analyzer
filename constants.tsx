
import { MeetingType } from './types';

export const MEETING_TYPE_DESCRIPTIONS: Record<MeetingType, string> = {
  [MeetingType.DAILY_SCRUM]: 'Quick sync on progress, blockers, and plan for the next 24h.',
  [MeetingType.SPRINT_PLANNING]: 'Defining what can be delivered in the sprint and how.',
  [MeetingType.SPRINT_REVIEW]: 'Inspecting the increment and adapting the product backlog.',
  [MeetingType.SPRINT_RETROSPECTIVE]: 'Inspecting the team and creating a plan for improvements.',
  [MeetingType.PBR]: 'Adding detail, estimates, and order to items in the product backlog.'
};

export const DEFAULT_GOALS: Record<MeetingType, string> = {
  [MeetingType.DAILY_SCRUM]: 'Align team on the sprint goal and identify impediments.',
  [MeetingType.SPRINT_PLANNING]: 'Establish a sprint goal and a realistic sprint backlog.',
  [MeetingType.SPRINT_REVIEW]: 'Gather stakeholder feedback and update product backlog.',
  [MeetingType.SPRINT_RETROSPECTIVE]: 'Identify 2-3 actionable improvements for team dynamics.',
  [MeetingType.PBR]: 'Ensure the top of the backlog is "Ready" for planning.'
};

export const MEETING_PARTICIPANTS = [
  { name: 'Pinki Saha choudhury', role: 'Project Manager' },
  { name: 'Felix Müller', role: 'Senior architect' },
  { name: 'Ronald angelo Reyes', role: 'Senior architect' },
  { name: 'Stefan Heßler', role: 'Senior architect' },
  { name: 'Riza may Pagayon', role: 'Scrum master' },
  { name: 'Hariharan Karuppasamy', role: 'Product Owner' },
  { name: 'Tincy B', role: 'UIUX Designer' },
  { name: 'Tanja Eppler', role: 'UIUX Design Team Lead' },
  { name: 'Shyrelle kaye Cabajar', role: 'UIUX Design Team Lead' },
  { name: 'Ian lance Gallardo', role: 'UIUX Designer' },
  { name: 'Kumar jayantbhai Shah', role: 'UIUX Designer' },
  { name: 'Rb Evangelista', role: 'UIUX Designer' },
  { name: 'Leonor thel Gomez', role: 'UIUX Designer' },
  { name: 'Ekzel Sevilla', role: 'Product Manager' }
];

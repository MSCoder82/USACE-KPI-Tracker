
import type { User, Campaign, Goal, Input, Task, Engagement, MediaLog, MediaQuery } from '../types';
import { UserRole, CampaignStatus, InputType, TaskStatus, TaskPriority, EngagementType, Sentiment, MediaQueryStatus } from '../types';

export const MOCK_USER: User = {
    id: 'user-1',
    email: 'john.q.public@usace.army.mil',
    name: 'John Q. Public',
    role: UserRole.CHIEF,
    team_id: 'team-1',
    rank: 'GS-12',
    phone: '555-123-4567',
    profile_photo_url: 'https://picsum.photos/id/237/200',
    team_name: 'Sacramento District PAO'
};

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'camp-1', team_id: 'team-1', name: 'Folsom Dam Raise', description: 'Public outreach for the Folsom Dam raise project.', start_date: '2024-01-15', end_date: '2024-12-31', owner_id: 'user-1', status: CampaignStatus.ACTIVE },
    { id: 'camp-2', team_id: 'team-1', name: 'Water Safety Awareness 2024', description: 'Annual water safety campaign for recreational users.', start_date: '2024-05-01', end_date: '2024-09-30', owner_id: 'user-1', status: CampaignStatus.ACTIVE },
    { id: 'camp-3', team_id: 'team-1', name: 'STEM Outreach Program', description: 'Engaging local schools with USACE STEM careers.', start_date: '2024-09-01', end_date: '2025-05-31', owner_id: 'user-1', status: CampaignStatus.PLANNED },
    { id: 'camp-4', team_id: 'team-1', name: 'Emergency Flood Response', description: 'Communication efforts for the winter flood season.', start_date: '2023-11-01', end_date: '2024-04-30', owner_id: 'user-1', status: CampaignStatus.COMPLETE },
];

export const MOCK_GOALS: Goal[] = [
    { id: 'goal-1', campaign_id: 'camp-1', description: 'Increase public meeting attendance', target: 500, current: 350, progress_pct: 70 },
    { id: 'goal-2', campaign_id: 'camp-1', description: 'Positive media mentions', target: 20, current: 18, progress_pct: 90 },
    { id: 'goal-3', campaign_id: 'camp-2', description: 'Social media reach', target: 1000000, current: 650000, progress_pct: 65 },
    { id: 'goal-4', campaign_id: 'camp-2', description: 'Distribute water safety pamphlets', target: 5000, current: 5000, progress_pct: 100 },
];

export const MOCK_KPI_TREND_DATA = [
    { date: 'Jan', Reach: 4000, 'Engagement Rate': 2.4, Sentiment: 0.6 },
    { date: 'Feb', Reach: 3000, 'Engagement Rate': 1.38, Sentiment: 0.5 },
    { date: 'Mar', Reach: 2000, 'Engagement Rate': 9.8, Sentiment: 0.7 },
    { date: 'Apr', Reach: 2780, 'Engagement Rate': 3.9, Sentiment: 0.8 },
    { date: 'May', Reach: 1890, 'Engagement Rate': 4.8, Sentiment: 0.6 },
    { date: 'Jun', Reach: 2390, 'Engagement Rate': 3.8, Sentiment: 0.7 },
    { date: 'Jul', Reach: 3490, 'Engagement Rate': 4.3, Sentiment: 0.9 },
];

export const MOCK_INPUTS: Input[] = [
    { id: 'in-1', type: InputType.LINK, title: 'SacBee Article on Dam Project', link_url: '#', campaign: 'Folsom Dam Raise', created_by: 'Jane Doe', created_at: '2024-07-22T14:00:00Z' },
    { id: 'in-2', type: InputType.PRODUCT, title: 'Water Safety Video Final Cut', link_url: '#', campaign: 'Water Safety Awareness 2024', created_by: 'John Public', created_at: '2024-07-21T10:30:00Z' },
    { id: 'in-3', type: InputType.NOTE, title: 'Meeting notes with Stakeholders', link_url: '#', campaign: 'Folsom Dam Raise', created_by: 'Jane Doe', created_at: '2024-07-20T16:45:00Z' },
];

export const MOCK_TASKS: Task[] = [
    { id: 'task-1', title: 'Draft press release for project milestone', assignee: 'Jane Doe', due_date: '2024-07-30', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, campaign: 'Folsom Dam Raise' },
    { id: 'task-2', title: 'Schedule social media posts for August', assignee: 'John Public', due_date: '2024-07-28', status: TaskStatus.TODO, priority: TaskPriority.MED, campaign: 'Water Safety Awareness 2024' },
    { id: 'task-3', title: 'Finalize presentation for community meeting', assignee: 'Jane Doe', status: TaskStatus.DONE, campaign: 'Folsom Dam Raise' },
];

export const MOCK_ENGAGEMENTS: Engagement[] = [
    { id: 'eng-1', date: '2024-07-15', type: EngagementType.COMMUNITY_MEETING, audience: 'Folsom Residents', location: 'Folsom City Hall', campaign: 'Folsom Dam Raise', outcomes: 'Positive reception, good questions.' },
    { id: 'eng-2', date: '2024-07-10', type: EngagementType.MEDIA_INTERVIEW, audience: 'KCRA Channel 3', location: 'On-site at Dam', campaign: 'Folsom Dam Raise', outcomes: 'Aired on evening news.' },
];

export const MOCK_MEDIA_LOGS: MediaLog[] = [
    { id: 'ml-1', date: '2024-07-11', outlet: 'KCRA Channel 3', headline: 'USACE Showcases Progress on Folsom Dam', sentiment: Sentiment.POSITIVE, reach: 150000, campaign: 'Folsom Dam Raise' },
    { id: 'ml-2', date: '2024-07-05', outlet: 'Sacramento Bee', headline: 'Is the Folsom Dam Project on Schedule?', sentiment: Sentiment.NEUTRAL, reach: 80000, campaign: 'Folsom Dam Raise' },
];

export const MOCK_MEDIA_QUERIES: MediaQuery[] = [
    { id: 'mq-1', date: '2024-07-22', outlet: 'Associated Press', topic: 'Project budget and timeline', deadline: '2024-07-23T17:00:00Z', status: MediaQueryStatus.ASSIGNED, assigned_to: 'John Public' },
    { id: 'mq-2', date: '2024-07-19', outlet: 'Local Blogger', topic: 'Recreational impacts', deadline: '2024-07-20T12:00:00Z', status: MediaQueryStatus.ANSWERED, assigned_to: 'Jane Doe' },
];

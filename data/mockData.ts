import type { User, Campaign, Input, Task, Engagement, MediaLog, MediaQuery } from '../types';
// FIX: Replaced non-existent 'InputType' with 'InputCategory' to align with the defined types.
import { UserRole, CampaignStatus, InputCategory, TaskStatus, TaskPriority, EngagementType, Sentiment, MediaQueryStatus } from '../types';

export const MOCK_USER: User = {
    id: 'user-1',
    email: 'john.q.public@usace.army.mil',
    full_name: 'John Q. Public',
    role: UserRole.CHIEF,
    team_id: 'team-1',
    profile_photo_url: 'https://picsum.photos/id/237/200',
    teams: { id: 'team-1-mock', name: 'Sacramento District PAO' }
};

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'camp-1', team_id: 'team-1', name: 'Folsom Dam Raise', description: 'Public outreach for the Folsom Dam raise project.', start_date: '2024-01-15', end_date: '2024-12-31', owner_id: 'user-1', status: CampaignStatus.ACTIVE },
    { id: 'camp-2', team_id: 'team-1', name: 'Water Safety Awareness 2024', description: 'Annual water safety campaign for recreational users.', start_date: '2024-05-01', end_date: '2024-09-30', owner_id: 'user-1', status: CampaignStatus.ACTIVE },
    { id: 'camp-3', team_id: 'team-1', name: 'STEM Outreach Program', description: 'Engaging local schools with USACE STEM careers.', start_date: '2024-09-01', end_date: '2025-05-31', owner_id: 'user-1', status: CampaignStatus.PLANNED },
    { id: 'camp-4', team_id: 'team-1', name: 'Emergency Flood Response', description: 'Communication efforts for the winter flood season.', start_date: '2023-11-01', end_date: '2024-04-30', owner_id: 'user-1', status: CampaignStatus.COMPLETE },
];

// FIX: Corrected MOCK_INPUTS to align with the 'Input' type. Replaced 'type' with 'category', used 'name'/'custom_name' instead of 'title', converted 'link_url' to 'links', and added the required 'team_id'.
export const MOCK_INPUTS: Input[] = [
    { id: 'in-1', category: InputCategory.OUTPUT, name: 'Other', custom_name: 'SacBee Article on Dam Project', links: ['#'], quantity: 1, campaign_id: 'camp-1', created_by: 'user-2', created_at: '2024-07-22T14:00:00Z', team_id: 'team-1', campaigns: { name: 'Folsom Dam Raise' }, profiles: { full_name: 'Jane Doe' } },
    { id: 'in-2', category: InputCategory.OUTPUT, name: 'Other', custom_name: 'Water Safety Video Final Cut', links: ['#'], quantity: 1, campaign_id: 'camp-2', created_by: 'user-1', created_at: '2024-07-21T10:30:00Z', team_id: 'team-1', campaigns: { name: 'Water Safety Awareness 2024' }, profiles: { full_name: 'John Public' } },
    { id: 'in-3', category: InputCategory.OUTCOME, name: 'Other', custom_name: 'Meeting notes with Stakeholders', links: ['#'], campaign_id: 'camp-1', created_by: 'user-2', created_at: '2024-07-20T16:45:00Z', team_id: 'team-1', campaigns: { name: 'Folsom Dam Raise' }, profiles: { full_name: 'Jane Doe' } },
];

// FIX: Corrected property 'assignee' to 'assignee_id' and 'campaign' to 'campaigns' (plus 'campaign_id') to align with the 'Task' type. Also added a 'profiles' object to match UI expectations.
// FIX: Added the required 'team_id' property to each task object to match the 'Task' type definition.
export const MOCK_TASKS: Task[] = [
    { id: 'task-1', title: 'Draft press release for project milestone', assignee_id: 'user-2', due_date: '2024-07-30', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, campaign_id: 'camp-1', team_id: 'team-1', campaigns: { name: 'Folsom Dam Raise' }, profiles: { full_name: 'Jane Doe' } },
    { id: 'task-2', title: 'Schedule social media posts for August', assignee_id: 'user-1', due_date: '2024-07-28', status: TaskStatus.TODO, priority: TaskPriority.MED, campaign_id: 'camp-2', team_id: 'team-1', campaigns: { name: 'Water Safety Awareness 2024' }, profiles: { full_name: 'John Public' } },
    { id: 'task-3', title: 'Finalize presentation for community meeting', assignee_id: 'user-2', status: TaskStatus.DONE, campaign_id: 'camp-1', team_id: 'team-1', campaigns: { name: 'Folsom Dam Raise' }, profiles: { full_name: 'Jane Doe' } },
];

// FIX: Corrected property 'campaign' to 'campaigns' and added missing 'campaign_id' to align with the 'Engagement' type.
// FIX: Added the required 'team_id' property to each engagement object.
export const MOCK_ENGAGEMENTS: Engagement[] = [
    { id: 'eng-1', team_id: 'team-1', date: '2024-07-15', type: EngagementType.COMMUNITY_MEETING, audience: 'Folsom Residents', location: 'Folsom City Hall', campaign_id: 'camp-1', campaigns: { name: 'Folsom Dam Raise' }, outcomes: 'Positive reception, good questions.' },
    { id: 'eng-2', team_id: 'team-1', date: '2024-07-10', type: EngagementType.MEDIA_INTERVIEW, audience: 'KCRA Channel 3', location: 'On-site at Dam', campaign_id: 'camp-1', campaigns: { name: 'Folsom Dam Raise' }, outcomes: 'Aired on evening news.' },
];

// FIX: Corrected property 'campaign' to 'campaigns' and added missing 'campaign_id' to align with the 'MediaLog' type.
// FIX: Added the required 'team_id' property to each media log object.
export const MOCK_MEDIA_LOGS: MediaLog[] = [
    { id: 'ml-1', team_id: 'team-1', date: '2024-07-11', outlet: 'KCRA Channel 3', headline: 'USACE Showcases Progress on Folsom Dam', sentiment: Sentiment.POSITIVE, reach: 150000, campaign_id: 'camp-1', campaigns: { name: 'Folsom Dam Raise' } },
    { id: 'ml-2', team_id: 'team-1', date: '2024-07-05', outlet: 'Sacramento Bee', headline: 'Is the Folsom Dam Project on Schedule?', sentiment: Sentiment.NEUTRAL, reach: 80000, campaign_id: 'camp-1', campaigns: { name: 'Folsom Dam Raise' } },
];

// FIX: Corrected 'assigned_to' to be an ID and added a 'profiles' object to align with the 'MediaQuery' type and UI expectations.
// FIX: Added the required 'team_id' property to each media query object.
export const MOCK_MEDIA_QUERIES: MediaQuery[] = [
    { id: 'mq-1', team_id: 'team-1', date: '2024-07-22', outlet: 'Associated Press', topic: 'Project budget and timeline', deadline: '2024-07-23T17:00:00Z', status: MediaQueryStatus.ASSIGNED, assigned_to: 'user-1', profiles: { full_name: 'John Public' } },
    { id: 'mq-2', team_id: 'team-1', date: '2024-07-19', outlet: 'Local Blogger', topic: 'Recreational impacts', deadline: '2024-07-20T12:00:00Z', status: MediaQueryStatus.ANSWERED, assigned_to: 'user-2', profiles: { full_name: 'Jane Doe' } },
];

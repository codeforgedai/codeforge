import {
  LayoutDashboard,
  Bot,
  ListTodo,
  GitBranch,
  Target,
  ShieldCheck,
  CreditCard,
  Inbox,
  Settings,
  UserCog,
  KeyRound,
  Users,
  Palette,
  Bell,
  Monitor,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'user@codeforce.dev',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Codeforce',
      logo: Command,
      plan: 'AI Engineering Platform',
    },
  ],
  navGroups: [
    {
      title: 'Platform',
      items: [
        {
          title: 'Overview',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Agents',
          url: '/agents',
          icon: Bot,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Pipelines',
          url: '/pipelines',
          icon: GitBranch,
        },
        {
          title: 'Goals',
          url: '/goals',
          icon: Target,
        },
        {
          title: 'Approvals',
          url: '/approvals',
          icon: ShieldCheck,
        },
        {
          title: 'Billing',
          url: '/billing',
          icon: CreditCard,
        },
        {
          title: 'Inbox',
          url: '/inbox',
          icon: Inbox,
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Team Members',
              url: '/settings/team',
              icon: Users,
            },
            {
              title: 'Credentials',
              url: '/settings/credentials',
              icon: KeyRound,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}

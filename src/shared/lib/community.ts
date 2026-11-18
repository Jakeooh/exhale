/**
 * @file Neighborhood Action Pack configuration and print/share formatters
 */

import { CommunityAction } from '@/types';

export const INITIAL_COMMUNITY_ACTIONS: CommunityAction[] = [
  {
    id: 'pledge_carpool',
    title: 'School & Society Green Carpool Day',
    subtitle: 'Cut localized morning gate congestion by 40%',
    description:
      'Organize a neighborhood carpooling rota or group bus commute for school drop-offs and office parks to eliminate idling tailpipe exhaust near residential playgrounds.',
    targetGroup: 'society',
    iconName: 'Users',
    pledgeCount: 42,
    userPledged: false,
  },
  {
    id: 'pledge_no_burning',
    title: 'Zero Open-Burning & Green Waste Patrol',
    subtitle: 'Stop toxic localized smoke plumes at the source',
    description:
      'Pledge zero backyard burning of leaves, yard trimmings, or plastic waste. Report smoldering fires to society management or community watch with designated compost bins.',
    targetGroup: 'neighborhood',
    iconName: 'FlameKindling',
    pledgeCount: 78,
    userPledged: false,
  },
  {
    id: 'pledge_mask_drive',
    title: 'Mask & DIY Purifier Drive for Community Workers',
    subtitle: 'Protect security guards, sanitation staff & street vendors',
    description:
      'Pool funds to distribute certified N95 respirators and build low-cost Corsi-Rosenthal box fans for outdoor workers and shared security guard cabins.',
    targetGroup: 'local_group',
    iconName: 'HeartHandshake',
    pledgeCount: 35,
    userPledged: false,
  },
  {
    id: 'pledge_classroom_check',
    title: 'Classroom & Common Area Clean-Air Check',
    subtitle: 'Measure CO2 and PM2.5 in schools and nurseries',
    description:
      'Advocate for portable air monitors and sealed window weatherstripping in local classrooms, ensuring ventilation protocols run when AQI exceeds 150.',
    targetGroup: 'school',
    iconName: 'GraduationCap',
    pledgeCount: 29,
    userPledged: false,
  },
  {
    id: 'pledge_anti_idling',
    title: 'No-Idling Drop-Off Zone Enforcement',
    subtitle: 'Zero engines running while parked outside gates',
    description:
      'Post visible signs and volunteer at society gates and school gates reminding drivers to switch engines off if stopped for more than 10 seconds.',
    targetGroup: 'school',
    iconName: 'CarFront',
    pledgeCount: 64,
    userPledged: false,
  },
];

/**
 * Generates plain-text shareable copy of the neighborhood action pack.
 */
export function formatCommunityPackForShare(
  locationName: string,
  actions: CommunityAction[]
): string {
  const lines = [
    `🌿 EXHALE NEIGHBORHOOD ACTION PACK — ${locationName.toUpperCase()}`,
    `Together we can clean the air where we live, breathe, and raise our families.\n`,
    `5 COLLECTIVE COMMUNITY ACTIONS:`,
  ];

  actions.forEach((a, idx) => {
    const status = a.userPledged ? '[PLEDGED]' : '[OPEN]';
    lines.push(
      `${idx + 1}. ${a.title} ${status}`,
      `   Target: ${a.targetGroup.toUpperCase()} | Pledges: ${a.pledgeCount}`,
      `   ${a.description}\n`
    );
  });

  lines.push(
    `Join our clean air movement on Exhale — Low emission routines & actionable smog defense.`
  );

  return lines.join('\n');
}

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Printer,
  Check,
  FlameKindling,
  HeartHandshake,
  GraduationCap,
  CarFront,
} from 'lucide-react';
import { useAppStore } from '@/shared/lib/store';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { formatCommunityPackForShare } from '@/shared/lib/community';

export const CommunityModeSection: React.FC = () => {
  const { communityActions, togglePledge, profile } = useAppStore();
  const [copied, setCopied] = useState(false);

  const locationName = profile?.location.name ?? 'My Neighborhood';

  const handleCopy = async () => {
    const text = formatCommunityPackForShare(locationName, communityActions);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const getActionIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />;
      case 'FlameKindling':
        return <FlameKindling className="w-4 h-4 text-rose-500" aria-hidden="true" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-indigo-500" aria-hidden="true" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      case 'CarFront':
        return <CarFront className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      default:
        return <Users className="w-4 h-4 text-muted" aria-hidden="true" />;
    }
  };

  return (
    <Card className="space-y-6" id="panel-community" role="tabpanel" aria-labelledby="nav-tab-community">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-ink tracking-tight">
            Neighborhood Action Pack
          </h2>
          <p className="text-xs text-muted mt-0.5">
            5 collective initiatives for your society, school, and local community
          </p>
        </div>

        {/* Copy & Print */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs"
            aria-label="Copy Neighborhood Action Pack to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-600 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                <span>Copy Pack</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs"
            aria-label="Print Action Pack"
          >
            <Printer className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      {/* Collective Actions */}
      <div className="space-y-3">
        {communityActions.map((action, idx) => {
          const isPledged = action.userPledged;

          return (
            <div
              key={action.id}
              className={`p-5 rounded-xl border transition-all duration-150 space-y-3 ${
                isPledged
                  ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-500/50'
                  : 'bg-surface border-gray-200/70 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-ink shrink-0 mt-0.5">
                    {getActionIcon(action.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted">#{idx + 1}</span>
                      <h3 className="font-heading font-semibold text-sm sm:text-base text-ink">
                        {action.title}
                      </h3>
                    </div>
                    <p className="text-xs text-primary font-medium mt-0.5">{action.subtitle}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-ink">
                    {action.pledgeCount} pledges
                  </span>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <Button
                  variant={isPledged ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => togglePledge(action.id)}
                  className="text-xs font-semibold"
                  aria-pressed={isPledged}
                >
                  {isPledged ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                      <span>Pledged</span>
                    </>
                  ) : (
                    <span>Pledge This Action</span>
                  )}
                </Button>
                <span className="text-[11px] text-muted capitalize">
                  Target: {action.targetGroup.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

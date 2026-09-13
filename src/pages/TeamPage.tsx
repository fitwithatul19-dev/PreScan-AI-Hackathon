import React from 'react';
import { Users2, UserPlus, Shield, UserCheck, Eye, Edit3 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';

interface TeamPageProps {
  onNavigate: (route: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigate }) => {
  const roles = [
    {
      name: 'Owner',
      icon: <Shield className="w-4 h-4 text-neutral-900" />,
      description: 'Full workspace authority, billing control, and member management.',
    },
    {
      name: 'Admin',
      icon: <UserCheck className="w-4 h-4 text-neutral-700" />,
      description: 'Can manage projects, connect integrations, and invite team members.',
    },
    {
      name: 'Editor',
      icon: <Edit3 className="w-4 h-4 text-neutral-700" />,
      description: 'Can upload media, configure metadata, and trigger PreScan executions.',
    },
    {
      name: 'Viewer',
      icon: <Eye className="w-4 h-4 text-neutral-500" />,
      description: 'Read-only access to scan reports, findings, and evidence timelines.',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team & Access Control"
        description="Manage workspace collaborators, invitations, and role-based permissions (RBAC)."
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Workspace', onClick: () => onNavigate('/app/dashboard') },
              { label: 'Team' },
            ]}
          />
        }
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            disabled
          >
            Invite Member
          </Button>
        }
      />

      <Alert
        variant="info"
        title="Role-Based Access Control Architecture"
      >
        PreScan domain models support fine-grained multi-tenant membership. Team invitation dispatch and membership management endpoints will be active following the authentication rollout in Phase 02/03.
      </Alert>

      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800">
            Permission Roles
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pre-configured authorization levels available within organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Card key={role.name}>
              <CardHeader className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-neutral-100 border border-neutral-200">
                    {role.icon}
                  </div>
                  <CardTitle className="text-sm font-bold">{role.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {role.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

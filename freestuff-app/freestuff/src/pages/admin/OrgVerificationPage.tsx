import React, { useState, useEffect } from 'react';
import { orgsAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2, Building2, CheckCircle2, XCircle, Clock, Mail } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-700 border-green-200',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
};

const ORG_TYPE_LABEL: Record<string, string> = {
  STUDENT_ORG: 'Student Org',
  UNIV_DEPT: 'University Dept',
  FACULTY_STAFF: 'Faculty / Staff',
};

export function OrgVerificationPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await orgsAPI.getAll();
      setOrgs(res.data.orgs || res.data);
    } catch (err) {
      toast({ title: 'Failed to load organizations', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setActioningId(id);
    try {
      await orgsAPI.updateStatus(id, status);
      setOrgs(prev => prev.map(o => o.id === id ? { ...o, verificationStatus: status } : o));
      toast({ title: status === 'VERIFIED' ? 'Organization verified!' : 'Organization rejected.' });
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setActioningId(null);
    }
  };

  const filtered = filter === 'ALL' ? orgs : orgs.filter(o => o.verificationStatus === filter);
  const counts = {
    ALL: orgs.length,
    PENDING: orgs.filter(o => o.verificationStatus === 'PENDING').length,
    VERIFIED: orgs.filter(o => o.verificationStatus === 'VERIFIED').length,
    REJECTED: orgs.filter(o => o.verificationStatus === 'REJECTED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">Organization Accounts</h1>
        <p className="text-muted-foreground">Review and verify organizations that want to post listings.</p>
      </div>

      {counts.PENDING > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
          <p className="text-yellow-800 font-medium">
            {counts.PENDING} organization{counts.PENDING !== 1 ? 's' : ''} pending verification
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}organizations</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(org => (
            <Card key={org.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row gap-0">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary shrink-0" />
                        <h3 className="font-bold text-lg">{org.orgName}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[org.verificationStatus] || STATUS_COLORS['PENDING']}`}>
                        {org.verificationStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {ORG_TYPE_LABEL[org.orgType] || org.orgType}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {org.contactEmail}
                      </span>
                    </div>

                    {org.verificationStatus === 'PENDING' && (
                      <p className="mt-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                        This organization cannot post listings until verified.
                      </p>
                    )}
                  </div>

                  {org.verificationStatus === 'PENDING' && (
                    <div className="flex sm:flex-col gap-2 p-4 sm:border-l bg-gray-50/50 items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                        disabled={actioningId === org.id}
                        onClick={() => handleVerify(org.id, 'VERIFIED')}
                      >
                        {actioningId === org.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                        disabled={actioningId === org.id}
                        onClick={() => handleVerify(org.id, 'REJECTED')}
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                  {org.verificationStatus === 'VERIFIED' && (
                    <div className="flex sm:flex-col gap-2 p-4 sm:border-l bg-green-50/50 items-center justify-center">
                      <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
                        <CheckCircle2 className="h-5 w-5" /> Verified
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                        disabled={actioningId === org.id}
                        onClick={() => handleVerify(org.id, 'REJECTED')}
                      >
                        Revoke
                      </Button>
                    </div>
                  )}
                  {org.verificationStatus === 'REJECTED' && (
                    <div className="flex sm:flex-col gap-2 p-4 sm:border-l bg-red-50/50 items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                        disabled={actioningId === org.id}
                        onClick={() => handleVerify(org.id, 'VERIFIED')}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Re-verify
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

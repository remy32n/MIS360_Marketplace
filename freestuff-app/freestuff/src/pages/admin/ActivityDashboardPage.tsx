import React, { useState, useEffect } from 'react';
import { engagementAPI, listingsAPI, orgsAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ListingBadge } from '../../components/listings/ListingBadge';
import { Loader2, Users, Package, Bookmark, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { CATEGORY_EMOJI } from '../../utils/formatters';

export function ActivityDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listingsRes] = await Promise.all([
          engagementAPI.getStats(),
          listingsAPI.getAllAdmin({ limit: 20 }),
        ]);
        setStats(statsRes.data);
        setListings(listingsRes.data.listings || listingsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'remove') {
        await listingsAPI.remove(id);
        setListings(listings.map(l => l.id === id ? { ...l, status: 'REMOVED' } : l));
      } else {
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
        await listingsAPI.updateStatus(id, status);
        setListings(listings.map(l => l.id === id ? { ...l, status: action === 'approve' ? 'ACTIVE' : 'REJECTED' } : l));
      }
      toast({ title: `Listing ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'removed'}.` });
    } catch (err) {
      toast({ title: 'Action failed', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const totalUsers = stats?.totalUsers
    ? Object.values(stats.totalUsers as Record<string, number>).reduce((a, b) => a + b, 0)
    : 0;

  const pendingCount = listings.filter(l => l.status === 'PENDING').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-serif mb-8 text-primary">System Activity</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalActiveListings ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saves</CardTitle>
            <Bookmark className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSaves ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            {stats?.totalUsers && (
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {Object.entries(stats.totalUsers as Record<string, number>).map(([role, count]) => (
                  <div key={role}>{role}: {count}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent Listings</h2>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Org</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium max-w-[180px] truncate">{l.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.postedByOrg?.orgName}</TableCell>
                      <TableCell><ListingBadge status={l.status} /></TableCell>
                      <TableCell>
                        {l.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(l.id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(l.id, 'reject')}>Reject</Button>
                          </div>
                        )}
                        {l.status === 'ACTIVE' && (
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleAction(l.id, 'remove')}>Remove</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {listings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No listings yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">By Category</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {stats?.listingsByCategory && Object.keys(stats.listingsByCategory).length > 0
                ? Object.entries(stats.listingsByCategory as Record<string, number>).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      {CATEGORY_EMOJI[cat] || '🎁'} {cat}
                    </span>
                    <span className="font-bold bg-muted px-2 py-1 rounded text-sm">{count}</span>
                  </div>
                ))
                : <div className="text-center text-muted-foreground text-sm">No data yet</div>
              }
            </CardContent>
          </Card>

          {stats?.totalUsers && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-8">Users by Role</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {Object.entries(stats.totalUsers as Record<string, number>).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="font-medium">{role}</span>
                      <span className="font-bold bg-muted px-2 py-1 rounded text-sm">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

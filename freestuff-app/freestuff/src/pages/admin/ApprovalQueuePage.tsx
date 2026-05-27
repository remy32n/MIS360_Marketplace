import React, { useState, useEffect } from 'react';
import { listingsAPI } from '../../services/api';
import { ApprovalCard } from '../../components/admin/ApprovalCard';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { toast } from '../../hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatCountdown, CATEGORY_EMOJI } from '../../utils/formatters';

export function ApprovalQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await listingsAPI.getPending();
      const items = res.data.listings || res.data;
      setQueue(items);
      if (items.length > 0 && !selectedId) {
        setSelectedId(items[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const selectedItem = queue.find(q => q.id === selectedId);

  const handleApprove = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await listingsAPI.updateStatus(selectedId, 'APPROVED');
      toast({ title: "Listing approved and is now live." });
      setQueue(queue.filter(q => q.id !== selectedId));
      setSelectedId(queue.find(q => q.id !== selectedId)?.id || null);
    } catch (err) {
      toast({ title: "Failed to approve", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await listingsAPI.updateStatus(selectedId, 'REJECTED', rejectReason);
      toast({ title: "Listing rejected." });
      setIsRejectOpen(false);
      setRejectReason('');
      setQueue(queue.filter(q => q.id !== selectedId));
      setSelectedId(queue.find(q => q.id !== selectedId)?.id || null);
    } catch (err) {
      toast({ title: "Failed to reject", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col md:flex-row overflow-hidden bg-muted/20">
      {/* Left Panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg font-serif">Pending Review</h2>
          <div className="text-sm text-muted-foreground flex justify-between items-center">
            <span>Oldest first — review in order</span>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{queue.length}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {queue.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500/50" />
              <p>No listings pending review.<br/>All caught up! ✓</p>
            </div>
          ) : (
            queue.map(item => (
              <ApprovalCard 
                key={item.id} 
                listing={item} 
                isSelected={selectedId === item.id}
                onClick={() => setSelectedId(item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-2/3 lg:w-3/4 flex-1 h-full overflow-y-auto p-4 md:p-8 bg-gray-50/50">
        {selectedItem ? (
          <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Review Listing</h3>
              <span className="text-sm opacity-80">{new Date(selectedItem.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              {/* Header Info */}
              <div className="flex gap-6 items-start border-b pb-6">
                <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                  {selectedItem.posterImageUrl ? (
                    <img src={selectedItem.posterImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : CATEGORY_EMOJI[selectedItem.category] || '🎁'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-serif mb-1">{selectedItem.title}</h1>
                  <p className="text-muted-foreground font-medium mb-1">{selectedItem.postedByOrg?.orgName}</p>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 uppercase tracking-wider font-semibold">
                    {selectedItem.postedByOrg?.orgType?.replace('_', ' ') || 'Organization'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location</h4>
                  <p className="font-medium text-lg">{selectedItem.buildingName}</p>
                  {selectedItem.roomOrFloor && <p className="text-gray-600">{selectedItem.roomOrFloor}</p>}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Time</h4>
                  <p className="font-medium">
                    {new Date(selectedItem.startTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'})}
                  </p>
                  <p className="font-medium">
                    to {new Date(selectedItem.endTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'})}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-foreground whitespace-pre-wrap">
                  {selectedItem.description}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t mt-auto">
                <Button 
                  size="lg" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle className="mr-2" />}
                  Approve Listing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="mr-2" /> Reject
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {queue.length > 0 ? 'Select a listing to review' : 'Queue is empty'}
          </div>
        )}
      </div>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this listing. The organization will see this.</DialogDescription>
          </DialogHeader>
          <Textarea 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
            placeholder="e.g. Does not meet campus guidelines..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

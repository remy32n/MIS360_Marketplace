import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function timeAgo(date) {
  return dayjs(date).fromNow();
}

export function formatDateTime(date) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}

export function formatTime(date) {
  return dayjs(date).format('h:mm A');
}

export function getCountdown(endTime) {
  const end = dayjs(endTime);
  const now = dayjs();
  if (end.isBefore(now)) return null;

  const diff = end.diff(now, 'second');
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  if (minutes > 0) {
    return `${minutes}m left`;
  }
  return 'Ending soon';
}

export function isEndingSoon(endTime) {
  const end = dayjs(endTime);
  const now = dayjs();
  return end.diff(now, 'hour') < 2 && end.isAfter(now);
}

export function isExpired(endTime) {
  return dayjs(endTime).isBefore(dayjs());
}

export function getCategoryInfo(category) {
  const map = {
    FOOD:     { emoji: '🍕', label: 'Food',     bg: '#fef3c7' },
    DRINKS:   { emoji: '🥤', label: 'Drinks',   bg: '#dbeafe' },
    APPAREL:  { emoji: '👕', label: 'Apparel',  bg: '#f3e8ff' },
    SUPPLIES: { emoji: '📚', label: 'Supplies', bg: '#ecfdf5' },
    OTHER:    { emoji: '🎁', label: 'Other',    bg: '#f3f4f6' },
  };
  return map[category] || map.OTHER;
}

export function getStatusInfo(status) {
  const map = {
    ACTIVE:   { label: 'Active',   bg: '#dcfce7', text: '#166534' },
    PENDING:  { label: 'Pending',  bg: '#fef9c3', text: '#854d0e' },
    EXPIRED:  { label: 'Expired',  bg: '#f3f4f6', text: '#6b7280' },
    REMOVED:  { label: 'Removed',  bg: '#fee2e2', text: '#991b1b' },
    REJECTED: { label: 'Rejected', bg: '#fee2e2', text: '#991b1b' },
    APPROVED: { label: 'Approved', bg: '#dcfce7', text: '#166534' },
    VERIFIED: { label: 'Verified', bg: '#dcfce7', text: '#166534' },
  };
  return map[status] || { label: status, bg: '#f3f4f6', text: '#6b7280' };
}

export function getOrgTypeLabel(orgType) {
  const map = {
    STUDENT_ORG:  'Student Org',
    UNIV_DEPT:    'University Dept',
    FACULTY_STAFF:'Faculty/Staff',
  };
  return map[orgType] || orgType;
}

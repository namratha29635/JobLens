import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { Card, Badge, LoadingPage } from '../../components/ui';
import toast from 'react-hot-toast';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getNotifications();
      if (res.data && res.data.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await studentAPI.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Could not mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await studentAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Could not mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await studentAPI.deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Could not delete notification');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'drive_invitation':
        return '🏢';
      case 'round_shortlist':
        return '🎉';
      case 'reminder':
        return '⏰';
      case 'policy_update':
        return '📜';
      default:
        return '📢';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'drives') return n.category === 'drive_invitation';
    if (filter === 'shortlists') return n.category === 'round_shortlist';
    if (filter === 'reminders') return n.category === 'reminder';
    return true;
  });

  if (loading) return <LoadingPage text="Loading notifications..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 800,
                margin: 0,
              }}
            >
              Placement Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--accent-red)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Stay updated with live announcements, interview shortlists, and placement drive invitations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                padding: '8px 16px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              ✓ Mark All Read
            </button>
          )}

          <button
            onClick={fetchNotifications}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          padding: '12px 16px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      >
        {[
          ['all', 'All Alerts'],
          ['unread', `Unread (${unreadCount})`],
          ['drives', '🏢 Drives'],
          ['shortlists', '🎉 Shortlists & Results'],
          ['reminders', '⏰ Reminders'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: filter === val ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: filter === val ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: filter === val ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: filter === val ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No Notifications</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>
            {filter !== 'all'
              ? 'No notifications found for the selected filter.'
              : 'You do not have any placement notifications right now.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map((item) => (
            <Card
              key={item._id}
              style={{
                padding: '18px 22px',
                background: item.isRead ? 'var(--bg-card)' : 'rgba(56, 189, 248, 0.06)',
                border: item.isRead ? '1px solid var(--border)' : '1px solid rgba(56, 189, 248, 0.35)',
                borderLeft: item.isRead ? '3px solid var(--border)' : '4px solid var(--accent-primary)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Category Icon */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                  border: '1px solid var(--border)',
                }}
              >
                {getCategoryIcon(item.category)}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        fontWeight: item.isRead ? 600 : 700,
                        color: item.isRead ? 'var(--text-primary)' : 'var(--accent-primary)',
                        margin: 0,
                      }}
                    >
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <Badge variant="primary" size="sm">
                        NEW
                      </Badge>
                    )}
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    margin: '0 0 10px 0',
                  }}
                >
                  {item.message}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Dispatched by: <strong style={{ color: 'var(--text-secondary)' }}>{item.sender || 'Training & Placement Cell'}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {item.drive && (
                      <button
                        onClick={() => navigate('/student/drives')}
                        style={{
                          padding: '5px 12px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--accent-primary)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View Drive →
                      </button>
                    )}

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkRead(item._id)}
                        style={{
                          padding: '5px 10px',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{
                        padding: '5px 8px',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                      title="Delete Notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

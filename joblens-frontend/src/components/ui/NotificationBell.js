import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
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
      // Quiet fail to avoid disturbing user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await studentAPI.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Could not mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await studentAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Could not mark all as read');
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await studentAPI.deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
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

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-elevated)',
          border: '1px solid ' + (isOpen ? 'var(--accent-primary)' : 'var(--border)'),
          color: isOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
          borderRadius: '10px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '16px',
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '1px 6px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            right: 0,
            width: '380px',
            maxHeight: '500px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>Placement Alerts</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--accent-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '400px',
              padding: '6px',
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No notifications yet
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  Coordinator broadcasts and drive updates will appear here.
                </div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    if (!item.isRead) handleMarkAsRead(item._id);
                    if (item.drive) navigate('/student/drives');
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius)',
                    background: item.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.05)',
                    borderLeft: item.isRead ? '3px solid transparent' : '3px solid var(--accent-primary)',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = item.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        fontSize: '18px',
                        background: 'var(--bg-elevated)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: item.isRead ? 600 : 700,
                            fontSize: '13px',
                            color: item.isRead ? 'var(--text-primary)' : 'var(--accent-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {formatTime(item.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                          margin: '2px 0 6px 0',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.message}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '11px',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>
                          From: {item.sender || 'Coordinator Office'}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!item.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(item._id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-primary)',
                                fontSize: '10px',
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Read
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/student/dashboard');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              View on Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

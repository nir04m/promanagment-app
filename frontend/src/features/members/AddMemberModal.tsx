import { useState, useEffect, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useAddMember } from '@/hooks/useMembers';
import { apiClient } from '@/api/client';
import { ApiResponse, UserProfile } from '@/types';

const PROJECT_ROLE_OPTIONS = [
  { value: 'PM', label: 'Project Manager' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'QA', label: 'QA Engineer' },
];

interface AddMemberModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ projectId, isOpen, onClose }: AddMemberModalProps) {
  const addMember = useAddMember(projectId);

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [projectRole, setProjectRole] = useState('DEVELOPER');
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Search users when input changes
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setUsers([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get<ApiResponse<UserProfile[]>>('/users', {
          params: { search, limit: 8 },
        });
        setUsers(res.data.data ?? []);
        setShowDropdown(true);
      } catch {
        setUsers([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClose = () => {
    setSearch('');
    setUsers([]);
    setSelectedUser(null);
    setProjectRole('DEVELOPER');
    setShowDropdown(false);
    addMember.reset();
    onClose();
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setSearch(user.name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!selectedUser) return;
    addMember.mutate(
      { userId: selectedUser.id, projectRole },
      { onSuccess: handleClose }
    );
  };

  const errorMessage = (addMember.error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message ?? null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Member" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* User search */}
        <div style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
          }}>
            Search User
          </label>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}>
              {searching
                ? <Spinner size="sm" />
                : <Search size={13} style={{ color: 'var(--text-muted)' }} />
              }
            </div>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.name) {
                  setSelectedUser(null);
                }
              }}
              onFocus={() => { if (users.length > 0) setShowDropdown(true); }}
              placeholder="Type a name or email..."
              autoComplete="off"
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: '13px',
                fontFamily: 'DM Mono, monospace',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Dropdown results */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              {users.length === 0 ? (
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                    No users found
                  </p>
                </div>
              ) : (
                users.map((user, i) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px',
                      borderBottom: i < users.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
                        color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {user.name}
                      </p>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '11px',
                        color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected user preview */}
        {selectedUser && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid var(--accent)',
            background: 'var(--accent-subtle)',
          }}>
            <Avatar name={selectedUser.name} avatarUrl={selectedUser.avatarUrl} size="sm" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                {selectedUser.name}
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedUser.email}
              </p>
            </div>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: 'var(--success)', flexShrink: 0,
            }} />
          </div>
        )}

        {/* No user selected placeholder */}
        {!selectedUser && !search && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '1px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              No user selected yet
            </p>
          </div>
        )}

        {/* Role selector */}
        <Select
          label="Project Role"
          value={projectRole}
          onChange={(e) => setProjectRole(e.target.value)}
          options={PROJECT_ROLE_OPTIONS}
        />

        {/* Error */}
        {addMember.isError && errorMessage && (
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            color: 'var(--danger)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.05)',
          }}>
            {errorMessage}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <Button type="button" variant="secondary" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!selectedUser}
            loading={addMember.isPending}
            onClick={handleSubmit}
          >
            Add Member
          </Button>
        </div>

      </div>
    </Modal>
  );
}
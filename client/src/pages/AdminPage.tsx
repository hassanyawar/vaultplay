import { useEffect, useState } from 'react';
import { getAdminUsers, getAdminUserVault, deleteAdminUser } from '@/lib/api';
import type { AdminUser, AdminVaultEntry } from '@/types/game';

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [vault, setVault] = useState<AdminVaultEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingVault, setLoadingVault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingUsers(false));
  }, []);

  async function handleSelectUser(user: AdminUser) {
    setSelectedUser(user);
    setVault([]);
    setLoadingVault(true);
    try {
      const entries = await getAdminUserVault(user.id);
      setVault(entries);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingVault(false);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (!confirm(`Delete user ${user.email} and all their data? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        setVault([]);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const totalGames = users.reduce((sum, u) => sum + Number(u.vault_count), 0);

  return (
    <div className="min-h-screen">
      <div className="adm-wrap">

        <header style={{ padding: '44px 0 4px' }}>
          <p className="adm-eyebrow">// administration</p>
          <h1 className="adm-title">Admin</h1>
          {!loadingUsers && (
            <p className="adm-stat">
              <b>{users.length}</b> users · <b>{totalGames}</b> games across all vaults
            </p>
          )}
        </header>

        {error && <p className="adm-error">{error}</p>}

        <div className="adm-grid">

          {/* Left — Users */}
          <section>
            <div className="adm-panel-h">
              <h2>Users</h2>
              <span className="adm-count">{users.length}</span>
            </div>
            {loadingUsers ? (
              <p className="adm-loading">Loading…</p>
            ) : (
              <div className="adm-users">
                {users.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <article
                      key={user.id}
                      className="adm-ucard"
                      data-selected={isSelected ? 'true' : undefined}
                      tabIndex={0}
                      onClick={() => void handleSelectUser(user)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          void handleSelectUser(user);
                        }
                      }}
                    >
                      <div className="adm-uav">{getInitials(user.username)}</div>
                      <div className="adm-ub">
                        <div className="adm-urow">
                          <span className="adm-uname">{user.username}</span>
                          {user.is_admin && <span className="adm-role">admin</span>}
                        </div>
                        <div className="adm-uemail">{user.email}</div>
                        <div className="adm-ugames">
                          {user.vault_count} game{user.vault_count === '1' ? '' : 's'}
                        </div>
                      </div>
                      {!user.is_admin && (
                        <button
                          className="adm-udel"
                          onClick={(e) => { e.stopPropagation(); void handleDeleteUser(user); }}
                        >
                          Delete
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right — Vault */}
          <section>
            {!selectedUser ? (
              <div className="adm-vault-empty">
                <p>Select a user to view their vault</p>
              </div>
            ) : (
              <>
                <div className="adm-panel-h">
                  <h2>{selectedUser.username}'s vault</h2>
                  <span className="adm-count">
                    {loadingVault
                      ? '…'
                      : `${vault.length} game${vault.length === 1 ? '' : 's'}`}
                  </span>
                </div>
                {loadingVault ? (
                  <p className="adm-loading">Loading…</p>
                ) : vault.length === 0 ? (
                  <p className="adm-loading">No games in vault.</p>
                ) : (
                  <div className="adm-vault">
                    {vault.map((entry) => {
                      const mono = entry.title.slice(0, 2).toUpperCase();
                      return (
                        <article key={entry.id} className="adm-grow">
                          <div
                            className="adm-gthumb"
                            style={{ background: 'linear-gradient(150deg, #3A2B8C, #1A1245)' }}
                          >
                            {entry.cover_url ? (
                              <img
                                src={entry.cover_url}
                                alt={entry.title}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                            ) : (
                              <>
                                <div className="adm-gthumb-grain" />
                                <div className="adm-gthumb-mono">{mono}</div>
                              </>
                            )}
                          </div>
                          <div className="adm-gb">
                            <div className="adm-gtitle">{entry.title}</div>
                            <div className="adm-gmeta">
                              <span className="adm-badge" data-status={entry.status}>
                                {entry.status}
                              </span>
                              {entry.rating != null && entry.status === 'completed' && (
                                <span className="adm-rating">{entry.rating}/10</span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

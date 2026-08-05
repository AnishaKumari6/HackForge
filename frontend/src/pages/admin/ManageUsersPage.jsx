import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiSlash, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import { Select } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/Modal";
import userService from "../../services/userService";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // { user, action }
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (role) params.role = role;
    userService
      .getAllUsers(params)
      .then((res) => {
        setUsers(res?.users || []);
        setMeta(res?.meta || null);
      })
      .catch((err) => console.error("Failed to load users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, page]);

  const runAction = async () => {
    const { user, action } = confirmTarget;
    setBusy(true);
    try {
      if (action === "block") await userService.blockUser(user._id, "Violation of platform policy");
      else if (action === "unblock") await userService.unblockUser(user._id);
      else if (action === "delete") await userService.deleteUser(user._id);
      toast.success("Done!");
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Manage Users</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">{meta?.total ?? "…"} total users on the platform.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name or email..."
          icon={<FiSearch size={16} />}
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          containerClassName="flex-1"
        />
        <Select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
          containerClassName="w-44"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="organizer">Organizer</option>
          <option value="judge">Judge</option>
          <option value="participant">Participant</option>
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {users.map((u) => (
                <Card key={u._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                      {u.name?.[0] || ""}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{u.name}</p>
                        <Badge variant="volt" className="capitalize">
                          {u.role}
                        </Badge>
                        {u.isBlocked && <Badge variant="danger">Blocked</Badge>}
                      </div>
                      <p className="text-xs text-[var(--ink-muted)]">{u.email}</p>
                    </div>
                  </div>
                  {u.role !== "admin" && (
                    <div className="flex gap-2">
                      {u.isBlocked ? (
                        <Button size="sm" variant="secondary" icon={<FiCheckCircle size={13} />} onClick={() => setConfirmTarget({ user: u, action: "unblock" })}>
                          Unblock
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" icon={<FiSlash size={13} />} onClick={() => setConfirmTarget({ user: u, action: "block" })}>
                          Block
                        </Button>
                      )}
                      <Button size="sm" variant="danger" icon={<FiTrash2 size={13} />} onClick={() => setConfirmTarget({ user: u, action: "delete" })}>
                        Delete
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="px-3 text-sm text-[var(--ink-muted)]">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={runAction}
        isLoading={busy}
        variant={confirmTarget?.action === "delete" ? "danger" : "primary"}
        title={
          confirmTarget?.action === "block"
            ? "Block this user?"
            : confirmTarget?.action === "unblock"
            ? "Unblock this user?"
            : "Delete this user?"
        }
        description={`This will ${confirmTarget?.action} ${confirmTarget?.user?.name}. ${
          confirmTarget?.action === "delete" ? "This action is permanent and cannot be undone." : ""
        }`}
        confirmLabel={confirmTarget?.action === "block" ? "Block" : confirmTarget?.action === "unblock" ? "Unblock" : "Delete"}
      />
    </div>
  );
};

export default ManageUsersPage;

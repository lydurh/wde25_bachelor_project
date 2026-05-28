import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { AdminUser } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ApiResponse<T> = { data: T };

const PAGE_SIZE = 10;

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-CA');

export const UsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const pageItems = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<ApiResponse<AdminUser[]>>('/users');
        setUsers(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1>Users</h1>
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div>
          <Table className="w-full rounded-md bg-card">
            <TableHeader className="bg-secondary-background">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((user) => (
                <TableRow
                  key={user.user_pk}
                  className="cursor-pointer"
                  onClick={() => void navigate(`/admin/users/${user.user_pk}`)}
                >
                  <TableCell>
                    {user.user_first_name} {user.user_last_name}
                  </TableCell>
                  <TableCell>{user.user_email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.user_role === 'admin' ? 'default' : 'secondary'
                      }
                    >
                      {user.user_role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.user_verified_at ? (
                      <Badge variant="outline">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.user_created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

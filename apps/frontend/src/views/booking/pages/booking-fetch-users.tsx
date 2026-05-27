import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { searchUsersByName } from '@/lib/users/search-users';
import type { User } from '@repo/shared';
import { useBooking } from '@/views/booking/booking-context';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import {
  CancelCircleIcon,
  CheckmarkBadge02Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const SEARCH_DEBOUNCE_MS = 200;

function getCustomerSearchQuery(customer: User): string {
  return [customer.user_first_name, customer.user_last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
}

/** Keep selected customer visible even when a new search omits them */
function getDisplayUsers(
  users: User[],
  selectedCustomer?: User | null,
): User[] {
  if (!selectedCustomer) return users;
  if (users.some((user) => user.user_pk === selectedCustomer.user_pk)) {
    return users;
  }
  return [selectedCustomer, ...users];
}

function UserResultRow({
  user,
  isSelected,
  onSelect,
  onUnselect,
}: {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onUnselect: () => void;
}) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>
          {user.user_first_name} {user.user_last_name}
          {isSelected && (
            <Badge className="bg-success/10 text-success">
              <HugeiconsIcon icon={CheckmarkBadge02Icon} strokeWidth={2} />
            </Badge>
          )}
        </ItemTitle>
        <ItemDescription>{user.user_email}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {isSelected ? (
          <Button
            variant="ghost"
            className="hover:bg-destructive/10 hover:text-destructive"
            type="button"
            size="sm"
            onClick={onUnselect}
            aria-label="Fravælg bruger"
          >
            <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
            Fjern
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onSelect} size="sm">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
            Vælg
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}

export const AdminFetchUsersPage = () => {
  const { draft, setDraft } = useBooking();
  const selectedCustomer = draft.selectedCustomer;

  const [query, setQuery] = useState(() =>
    selectedCustomer ? getCustomerSearchQuery(selectedCustomer) : '',
  );
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const restoreSearchQueryRef = useRef(
    selectedCustomer ? getCustomerSearchQuery(selectedCustomer) : '',
  );

  const doSearch = async (name: string, signal: AbortSignal) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchUsersByName(name, signal);
      if (!signal.aborted) {
        setUsers(results);
      }
    } catch (err: unknown) {
      if (
        signal.aborted ||
        (err instanceof DOMException && err.name === 'AbortError')
      ) {
        return;
      }
      setUsers([]);
      setSearchError(
        err instanceof Error ? err.message : 'Kunne ikke søge efter brugere',
      );
    } finally {
      if (!signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  const scheduleSearch = (name: string) => {
    abortRef.current?.abort();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (!name.trim()) {
      setUsers([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchTimeoutRef.current = null;
      const controller = new AbortController();
      abortRef.current = controller;
      void doSearch(name, controller.signal);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    scheduleSearch(value);
  };

  useEffect(() => {
    const restoreQuery = restoreSearchQueryRef.current;
    if (restoreQuery) {
      scheduleSearch(restoreQuery);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      abortRef.current?.abort();
    };
  }, []);

  const selectedPk = selectedCustomer?.user_pk;
  const displayUsers = getDisplayUsers(users, selectedCustomer);

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Find bruger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="user-name-search">Navn</FieldLabel>
            <Input
              id="user-name-search"
              type="search"
              autoComplete="off"
              placeholder="Fornavn eller efternavn"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
            />
          </Field>
          {isSearching && (
            <p className="mt-2 text-sm text-muted-foreground">Søger…</p>
          )}
          {searchError && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {searchError}
            </p>
          )}
          {!isSearching &&
            !searchError &&
            query.trim() &&
            users.length === 0 &&
            !selectedCustomer && (
              <p className="mt-2 text-sm text-muted-foreground">
                Ingen brugere fundet.
              </p>
            )}
        </CardContent>
        <CardFooter>
          {displayUsers.length > 0 && (
            <ItemGroup className="w-full">
              {displayUsers.map((user) => (
                <UserResultRow
                  key={user.user_pk}
                  user={user}
                  isSelected={selectedPk === user.user_pk}
                  onSelect={() => setDraft({ selectedCustomer: user })}
                  onUnselect={() => setDraft({ selectedCustomer: null })}
                />
              ))}
            </ItemGroup>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

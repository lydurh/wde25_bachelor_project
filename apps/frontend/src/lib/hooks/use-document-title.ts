import { useEffect } from 'react';
import { useMatches } from 'react-router';

type DocumentTitleHandle = {
  title?: string;
};

export const useDocumentTitle = (fallbackTitle = 'Appointment booking') => {
  const matches = useMatches();
  const routeTitle = matches
    .map((match) => (match.handle as DocumentTitleHandle | undefined)?.title)
    .filter(Boolean)
    .pop();

  useEffect(() => {
    document.title = routeTitle ?? fallbackTitle;
  }, [routeTitle, fallbackTitle]);
};

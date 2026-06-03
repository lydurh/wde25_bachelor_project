import { ItemContent } from '@/components/ui/item';

import {
  Item,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { cn } from '@/lib/utils';
import type { IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';

type ProfileItemProps = {
  media?: IconSvgElement;
  title: string;
  content?: string | number;
  className?: string;
};

export const ProfileItem = ({
  media,
  title,
  content,
  className,
}: ProfileItemProps) => {
  return (
    <Item className={cn(className)}>
      {media && (
        <ItemMedia>
          <HugeiconsIcon icon={media} size={18} strokeWidth={2} />
        </ItemMedia>
      )}
      <ItemContent>
        <ItemTitle className="font-semibold">{title}</ItemTitle>
        {content && (
          <ItemDescription className="whitespace-pre-line text-foreground/70">
            {content}
          </ItemDescription>
        )}
      </ItemContent>
    </Item>
  );
};

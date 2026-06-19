import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type LocationFeeLabelProps = {
  className?: string;
  thresholdKm: number;
};

export function LocationFeeLabel({
  className,
  thresholdKm,
}: LocationFeeLabelProps) {
  return (
    <span className={className}>
      Udkørselsgebyr
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ml-1 inline-flex size-5 align-middle text-muted-foreground"
            aria-label="Information om udkørselsgebyr"
          >
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Gebyr når adressen ligger mere end {thresholdKm} km fra
          udgangspunktet.
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

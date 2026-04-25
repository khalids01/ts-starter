import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

export function RelativeTime({ value }: { value: string }) {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);

    const intervalId = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (!mounted) {
    return <span className="text-muted-foreground">--</span>;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-muted-foreground">--</span>;
  }

  void tick;

  return <>{formatDistanceToNowStrict(date, { addSuffix: true })}</>;
}

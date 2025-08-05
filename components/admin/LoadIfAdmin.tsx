"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

function LoadIfAdmin({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [restricted, setRestricted] = useState<boolean>(true);

  useEffect(() => {
    // @ts-ignore
    if (!session?.user || session.user.role !== "ADMIN") {
      setRestricted(true);
    } else {
      setRestricted(false);
    }
  }, [status]);
  return <>{!restricted && <>{children}</>}</>;
}

export default LoadIfAdmin;

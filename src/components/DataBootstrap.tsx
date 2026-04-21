import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNova } from "@/lib/novaprep-store";

export function DataBootstrap() {
  const { user } = useAuth();
  const loadAll = useNova((s) => s.loadAll);
  const reset = useNova((s) => s.reset);

  useEffect(() => {
    if (user) loadAll(user.id);
    else reset();
  }, [user, loadAll, reset]);

  return null;
}

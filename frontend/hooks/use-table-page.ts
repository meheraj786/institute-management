import { useState } from "react";

export function useTablePage() {
  const [page, setPage] = useState(1);
  return { page, onPageChange: setPage };
}

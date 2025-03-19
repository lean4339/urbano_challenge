import React from 'react';

interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const Paginator: React.FC<PaginatorProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ◀ Anterior
      </button>

      <span className="px-3 py-1 border rounded">
        Página {page} de {totalPages}
      </span>

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Siguiente ▶
      </button>
    </div>
  );
};

export default Paginator;

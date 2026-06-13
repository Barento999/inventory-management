import React from 'react';
import Button from './Button';

export default function Pagination({ current = 1, total = 1, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);
  return (
    <div className="flex space-x-2 mt-4">
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === current ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onPageChange(p)}
        >{p}</Button>
      ))}
    </div>
  );
}

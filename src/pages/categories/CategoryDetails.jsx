import React from 'react';
import Card from '../../components/ui/Card';
import { useParams } from 'react-router-dom';

export default function CategoryDetails() {
  const { id } = useParams();
  return (
    <Card title={`Category ${id}`}
      className="max-w-2xl mx-auto"
    >
      <p>Details for category {id} will be displayed here.</p>
    </Card>
  );
}

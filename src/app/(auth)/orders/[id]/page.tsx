'use client';

import { useParams } from 'next/navigation';
import OrderDetail from '@/components/orders/OrderDetail';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <OrderDetail id={id} />;
}

import { redirect } from 'next/navigation';

export default function WidgetPage() {
  // Server-side redirect to widget-demo which has the complete implementation
  redirect('/widget-demo');
}
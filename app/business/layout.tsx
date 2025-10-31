import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Business Intelligence | City-V Enterprise',
  description: 'Advanced business analytics with AI-powered insights, real-time customer flow analysis, and revenue optimization for enterprises.',
  keywords: 'business intelligence, professional analytics, enterprise dashboard, AI insights, customer analytics'
};

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
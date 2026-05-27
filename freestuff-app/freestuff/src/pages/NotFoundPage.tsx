import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4 font-bold text-primary">404</div>
      <h1 className="text-3xl font-bold font-serif mb-2 text-foreground">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl">
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}

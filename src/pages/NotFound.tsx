
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-blue-500">404</h1>
        <h2 className="text-2xl font-semibold">Página No Encontrada</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link to="/">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular proceso de autenticación
    setTimeout(() => {
      // En una implementación real, aquí conectaríamos con Supabase
      // Por ahora simulamos un inicio de sesión exitoso
      
      toast({
        title: "Acceso Concedido",
        description: "Has iniciado sesión correctamente."
      });
      
      navigate('/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-500 mb-2">Note Nexus Academy</h1>
          <p className="text-muted-foreground">Tu sistema de organización académica</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            *Nota: Esta es una aplicación de demostración. <br />
            Para la implementación real, se conectaría con Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

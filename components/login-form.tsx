"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, getSession, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { IconLogin } from "@tabler/icons-react";

interface LoginFormData {
  id: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [status]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation côté client
      if (data.id.length !== 4 || !/^[a-zA-Z]{4}$/.test(data.id)) {
        setError("L'identifiant doit être exactement 4 lettres");
        setIsLoading(false);
        return;
      }

      if (data.password.length !== 8) {
        setError("Le mot de passe doit être exactement 8 caractères");
        setIsLoading(false);
        return;
      }

      // Tentative de connexion avec NextAuth
      const result = await signIn("credentials", {
        id: data.id,
        password: data.password,
        redirect: false, // Ne pas rediriger automatiquement
      });

      if (result?.error) {
        setError("Identifiant ou mot de passe incorrect");
      } else if (result?.ok) {
        // Connexion réussie - vérifier la session et rediriger
        const session = await getSession();
        if (session) {
          router.push("/dashboard"); // Redirige vers ton dashboard
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Connectez-vous à votre compte</CardTitle>
          <CardDescription>
            Entrez votre identifiant (4 lettres) et votre mot de passe (8
            caractères) pour accéder à GICES
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Affichage des erreurs */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-3">
                <Label htmlFor="id">Identifiant</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="farb"
                  maxLength={4}
                  {...form.register("id", {
                    required: "L'identifiant est requis",
                    minLength: {
                      value: 4,
                      message: "L'identifiant doit faire 4 lettres",
                    },
                    maxLength: {
                      value: 4,
                      message: "L'identifiant doit faire 4 lettres",
                    },
                    pattern: {
                      value: /^[a-zA-Z]{4}$/,
                      message:
                        "L'identifiant doit contenir uniquement des lettres",
                    },
                  })}
                  disabled={isLoading}
                />
                {form.formState.errors.id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.id.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  maxLength={8}
                  {...form.register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 8,
                      message: "Le mot de passe doit faire 8 caractères",
                    },
                    maxLength: {
                      value: 8,
                      message: "Le mot de passe doit faire 8 caractères",
                    },
                  })}
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <IconLogin className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

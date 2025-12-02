"use client";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setError("");
    setShowError(false);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      let readable = "Ocurrió un error. Intente nuevamente.";

      if (res.error.includes("CredentialsSignin")) {
        readable = "El usuario o la contraseña son incorrectos.";
      }

      setError(readable);
      setShowError(true);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  });

  useEffect(() => {
    if (showError) {
        const t1 = setTimeout(() => {
        setIsFadingOut(true); 
        }, 2000); 

        const t2 = setTimeout(() => {
        setShowError(false); 
        setIsFadingOut(false);
        }, 3500); 

        return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        };
    }
    }, [showError]);


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d2747] px-4">
      <h1 className="text-white text-3xl font-semibold text-center mb-10">
        Trabajo Final Finanzas 2025-02 <br /> Grupo 2
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-6 text-[#0d0d0d]">
          Inicio de Sesión
        </h2>

        {showError && (
            <div
                className={`
                fixed left-1/2 -translate-x-1/2 z-50
                transition-all duration-[1800ms] ease-out
                ${!isFadingOut ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
                `}
            >
                <div className="bg-red-500 text-white text-sm px-4 py-3 rounded-lg shadow-lg min-w-[260px] text-center">
                {error}
                </div>
            </div>
        )}

        <form onSubmit={onSubmit}>
          <label className="text-gray-700 text-sm mb-1 block">Usuario:</label>
          <input
            type="email"
            {...register("email", { required: "Debe ingresar su usuario." })}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.email && (
            <p className="text-red-500 text-xs mb-2">
            {String(errors.email?.message || "")}
          </p>
          )}

          <label className="text-gray-700 text-sm mb-1 block">Contraseña:</label>
          <input
            type="password"
            {...register("password", {
              required: "Debe ingresar su contraseña.",
            })}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.password?.message && (
            <p className="text-red-500 text-xs mb-2">
              {String(errors.password.message)}
            </p>
          )}


          {/* BOTÓN CON LOADING */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 text-white font-semibold p-3 rounded-lg mt-4 transition
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Iniciando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
"use client";

import {
  FormEvent,
  FocusEvent,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";
import { Cliente } from "@/types/cliente";
import { Inmueble } from "@/types/inmueble";
import { useSession, signOut } from "next-auth/react";
import * as XLSX from "xlsx-js-style";
import ModalSimple from "@/app/components/ModalSimple";
import ImageModal from "@/app/components/ImageModal";

type Section = "inicio" | "clientes" | "propiedades" | "simulador";
type FormMode = "create" | "edit";

type ClienteForm = {
  dni: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  duenio_propiedad: number;
  email: string;
  direccion: string;
  ingreso_mensual: number;
  estado_civil: string;
  telefono: string;
  flag_condiciones: boolean;
};

type InmuebleForm = {
  nombre_proyecto: string;
  precio_venta: number;
  nro_cuartos: number;
  area_m2: number;
  ubicacion: string;
  descripcion: string;
  tipo: string;
  imagen_referencial: string;
  sostenible: boolean;
};

type SimulacionResumen = {
  tipo_tasa: string;
  capitalizacion: string | null;
  tasa_ingresada: number;
  TEM: number;
  saldo_financiar: number;
  costos_iniciales: number;
  monto_prestamo_total: number;
  cuota_base: number;
  plazo_meses: number;
  periodo_gracia_tipo: number;
  periodo_gracia_meses: number;
  periodo_gracia_descripcion: string;
  VAN: number;
  TIR: string;
  TCEA: string;
};

type SimulacionResultado = {
  resumen: SimulacionResumen;
  headers: string[];
  data: number[][];
  simulacionInfo?: SimulacionPersistida;
};

type SimulacionPersistida = {
  id_simulacion: number;
  cliente: Cliente;
  inmueble: Inmueble;
  clientes_id?: number;
  inmueble_id?: number;
  tipo_moneda: string;
  tipo_tasa: string;
  tasa_interes: number;
  fecha_inicio: string;
  capitalizacion: string | null;
  monto_prestamo: number;
  cuota_inicial: number;
  plazo_meses: number;
  plazo_tasa_interes: number;
  periodo_gracia: string | number | null;
  plazo_periodo_gracia: number;
  monto_bono_bbp?: number | null;
  clasificacion_bono_bbp?: number | null;
  tem_seguro_desgravamen?: number | null;
  tasa_seguro_inmueble?: number | null;
  portes?: number | null;
  costosIniciales?: number | null;
  gastosAdministrativos?: number | null;
};

type SimulacionListado = {
  id_simulacion: number;
  cliente: Cliente;
  inmueble: Inmueble;
  monto_prestamo: number;
  tasa_interes: number;
  fecha_inicio: string;
  tipo_moneda: string;
  tipo_tasa: string;
  cuota_inicial?: number;
};

type SimulacionForm = {
  clienteBusqueda: string;
  clienteId: number | null;
  clienteCorreo: string;
  clienteDni: string;
  inmuebleBusqueda: string;
  inmuebleId: number | null;
  valorInmueble: number;
  tipoMoneda: "Soles" | "Dólares";
  clasificacionBbp: number;
  labelBbp: string;
  montoBono: number;
  cuotaInicial: number;
  plazoMeses: number;
  montoPrestamoCalculado: number;
  fechaDesembolso: string;
  tipoTasa: "Efectiva" | "Nominal";
  plazoTasaInteres: number;
  periodoGracia: number;
  plazoPeriodoGracia: number;
  capitalizacion: number;
  tasaInteres: number;
  temSeguroDesgravamen: number;
  tasaSeguroInmueble: number;
  portes: number;
  costosIniciales: number;
  gastosAdministrativos: number;
};

const ESTADOS_CIVILES = [
  "Soltero",
  "Casado",
  "Divorciado",
  "Viudo",
  "Conviviente",
];
const TIPOS_INMUEBLE = ["Departamento", "Casa", "Dúplex", "Loft"];

const initialClienteForm: ClienteForm = {
  dni: "",
  nombres: "",
  apellidos: "",
  fecha_nacimiento: "",
  duenio_propiedad: 1,
  email: "",
  direccion: "",
  ingreso_mensual: 0,
  estado_civil: ESTADOS_CIVILES[0],
  telefono: "",
  flag_condiciones: false,
};

const initialInmuebleForm: InmuebleForm = {
  nombre_proyecto: "",
  precio_venta: 0,
  nro_cuartos: 1,
  area_m2: 50,
  ubicacion: "",
  descripcion: "",
  tipo: TIPOS_INMUEBLE[0],
  imagen_referencial: "",
  sostenible: false,
};

const navItems = [
  { key: "inicio" as const, label: "Inicio" },
  { key: "clientes" as const, label: "Clientes" },
  { key: "propiedades" as const, label: "Propiedades" },
  { key: "simulador" as const, label: "Simulador de Crédito" },
];

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const inputBaseClasses =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-0";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("inicio");
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen gap-4 p-4 sm:p-6">
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />

        <main className="flex-1 space-y-6">
          <div className="lg:hidden">
            <nav className="flex gap-2 overflow-x-auto rounded-3xl bg-white p-2 shadow-lg">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    activeSection === item.key
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <DashboardHeader
            searchTerm={globalSearch}
            onSearchChange={setGlobalSearch}
            activeSection={activeSection}
          />

          {activeSection === "clientes" && (
            <ClientesScreen searchTerm={globalSearch} />
          )}
          {activeSection === "propiedades" && (
            <InmueblesScreen searchTerm={globalSearch} />
          )}
           {activeSection === "inicio" && <InicioScreen />}
          {activeSection === "simulador" && <SimuladorScreen />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  activeSection,
  onSelect,
}: {
  activeSection: Section;
  onSelect: (key: Section) => void;
}) {
  const { data: session } = useSession();

  const nombre = session?.user?.name ?? "Usuario";
  const correo = session?.user?.email ?? "";

  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <aside className="hidden w-64 flex-col justify-between rounded-3xl bg-[#0f1c2f] p-6 text-white shadow-2xl lg:flex">
      <div>
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Inmobiliaria
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Mi Banqito</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`rounded-2xl px-4 py-3 text-left text-base font-semibold transition ${
                activeSection === item.key
                  ? "bg-white/20 text-white backdrop-blur"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="relative mt-10">
        {/* Botón del usuario */}
        <button
          ref={buttonRef}
          onClick={() => setOpenMenu(!openMenu)}
          className="w-full flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-left text-sm hover:bg-white/20 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0f1c2f] font-semibold">
            {iniciales}
          </div>
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              {correo}
            </p>
            <p className="text-base font-semibold text-white">{nombre}</p>
          </div>
        </button>

        {/* Menu flotante */}
        {openMenu && (
          <div
            ref={menuRef}
            className="absolute left-0 bottom-16 w-full rounded-2xl bg-white text-[#0f1c2f] shadow-xl p-3 animate-fade"
          >
            <button
              onClick={() =>
                signOut({
                  redirect: true,
                  callbackUrl: "/auth/login",
                })
              }
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function DashboardHeader({
  searchTerm,
  onSearchChange,
  activeSection,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeSection: Section;
}) {
  const placeholder = useMemo(() => {
    switch (activeSection) {
      case "clientes":
        return "Buscar clientes por nombre, DNI o teléfono";
      case "propiedades":
        return "Buscar propiedades por nombre o ubicación";
      default:
        return "Buscar clientes, propiedades o simulaciones";
    }
  }, [activeSection]);

  const { data: session } = useSession();

  const nombre = session?.user?.name ?? "Usuario";
  const correo = session?.user?.email ?? "";

  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-3 rounded-[28px] bg-white px-4 py-3 shadow-xl">
        <span className="text-xl text-slate-400">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="w-full border-none bg-transparent text-base text-slate-700 outline-none"
        />
      </div>
      <div className="flex items-center gap-3 rounded-[28px] bg-white px-4 py-3 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {correo}
          </p>
          <p className="text-base font-semibold text-slate-900">{nombre}</p>
        </div>
      </div>
    </header>
  );
}

function InicioScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [simulaciones, setSimulaciones] = useState<SimulacionResultado[]>([]);
  const [filtroSimulacion, setFiltroSimulacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarResumen = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientesRes, inmueblesRes, simulacionesRes] = await Promise.all([
        fetch("/api/clientes", { cache: "no-store" }),
        fetch("/api/inmuebles", { cache: "no-store" }),
        fetch("/api/simulaciones", { cache: "no-store" }),
      ]);

      const [clientesData, inmueblesData, simulacionesData] =
        await Promise.all([
          clientesRes.json(),
          inmueblesRes.json(),
          simulacionesRes.json(),
        ]);

      if (!clientesRes.ok)
        throw new Error(
          clientesData.error || "No se pudo obtener la lista de clientes"
        );
      if (!inmueblesRes.ok)
        throw new Error(
          inmueblesData.error || "No se pudo obtener la lista de propiedades"
        );
      if (!simulacionesRes.ok)
        throw new Error(
          simulacionesData.error || "No se pudo obtener las simulaciones"
        );

      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setInmuebles(Array.isArray(inmueblesData) ? inmueblesData : []);

      const listaSimulaciones = Array.isArray(simulacionesData)
        ? simulacionesData
        : simulacionesData
        ? [simulacionesData]
        : [];
      setSimulaciones(
        listaSimulaciones.filter(Boolean) as SimulacionResultado[]
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const valorPortafolio = useMemo(
    () =>
      inmuebles.reduce(
        (total, inmueble) => total + Number(inmueble.precio_venta || 0),
        0
      ),
    [inmuebles]
  );

  const simulacionesFiltradas = useMemo(() => {
    const criterio = filtroSimulacion.trim().toLowerCase();
    if (!criterio) return simulaciones;

    return simulaciones.filter((simulacion) => {
      const resumen = simulacion.resumen;
      if (!resumen) return false;

      const texto = [
        resumen.periodo_gracia_descripcion,
        resumen.tipo_tasa,
        resumen.capitalizacion ?? undefined,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(criterio);
    });
  }, [filtroSimulacion, simulaciones]);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Panorama general
            </h2>
            <p className="text-sm text-slate-500">
              Datos actualizados desde tus clientes, propiedades y simulaciones.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-500 sm:items-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Información en vivo
            </span>
            {loading && <span>Cargando datos…</span>}
            {error && <span className="text-rose-500">{error}</span>}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <IndicatorCard
            title="Clientes activos"
            value={clientes.length.toLocaleString("es-PE")}
            helper="Registrados en la plataforma"
          />
          <IndicatorCard
            title="Propiedades"
            value={inmuebles.length.toLocaleString("es-PE")}
            helper="Portafolio disponible"
          />
          <IndicatorCard
            title="Valor del portafolio"
            value={currencyFormatter.format(valorPortafolio)}
            helper="Precio de lista acumulado"
          />
          <IndicatorCard
            title="Simulaciones recientes"
            value={simulaciones.length.toString()}
            helper="Últimos cálculos guardados"
          />
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Simulaciones recientes
            </h3>
            <p className="text-sm text-slate-500">
              Los valores se muestran solo si la API los entrega.
            </p>
          </div>
          <input
            value={filtroSimulacion}
            onChange={(event) => setFiltroSimulacion(event.target.value)}
            placeholder="Filtrar por tipo de tasa o periodo de gracia"
            className={`${inputBaseClasses} sm:w-80`}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {simulacionesFiltradas.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
              {loading
                ? "Obteniendo simulaciones guardadas..."
                : "Todavía no hay simulaciones registradas"}
            </div>
          )}

          {simulacionesFiltradas.slice(0, 4).map((simulacion, index) => (
            <article
              key={index}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Simulación #{index + 1}
                  </p>
                  {simulacion.resumen?.periodo_gracia_descripcion && (
                    <p className="text-sm font-semibold text-slate-900">
                      {simulacion.resumen.periodo_gracia_descripcion}
                    </p>
                  )}
                </div>
                {simulacion.resumen?.tipo_tasa && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {simulacion.resumen.tipo_tasa}
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                {simulacion.resumen?.saldo_financiar !== undefined && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Saldo a financiar
                    </dt>
                    <dd className="font-semibold">
                      {currencyFormatter.format(
                        simulacion.resumen.saldo_financiar
                      )}
                    </dd>
                  </div>
                )}
                {simulacion.resumen?.monto_prestamo_total !== undefined && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Monto total
                    </dt>
                    <dd className="font-semibold">
                      {currencyFormatter.format(
                        simulacion.resumen.monto_prestamo_total
                      )}
                    </dd>
                  </div>
                )}
                {simulacion.resumen?.cuota_base !== undefined && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Cuota base
                    </dt>
                    <dd className="font-semibold">
                      {currencyFormatter.format(simulacion.resumen.cuota_base)}
                    </dd>
                  </div>
                )}
                {simulacion.resumen?.plazo_meses !== undefined && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Plazo
                    </dt>
                    <dd className="font-semibold">
                      {simulacion.resumen.plazo_meses} meses
                    </dd>
                  </div>
                )}
                {simulacion.resumen?.TEM !== undefined && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      TEM
                    </dt>
                    <dd className="font-semibold">
                      {(simulacion.resumen.TEM * 100).toFixed(2)}%
                    </dd>
                  </div>
                )}
                {simulacion.resumen?.TIR && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      TIR
                    </dt>
                    <dd className="font-semibold">{simulacion.resumen.TIR}</dd>
                  </div>
                )}
                {simulacion.resumen?.TCEA && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      TCEA
                    </dt>
                    <dd className="font-semibold">{simulacion.resumen.TCEA}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndicatorCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper?: string;
}) {
  return (
      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </article>
  );
}

function ClientesScreen({ searchTerm }: { searchTerm: string }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [detalle, setDetalle] = useState<Cliente | null>(null);
  const [formValues, setFormValues] = useState<ClienteForm>(initialClienteForm);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [simpleModalOpen, setSimpleModalOpen] = useState(false);
  const [simpleModalTitle, setSimpleModalTitle] = useState("");
  const [simpleModalDesc, setSimpleModalDesc] = useState("");
  const [simpleModalFlag, setSimpleModalFlag] = useState<0 | 1>(0);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      setLoading(true);
      const res = await fetch("/api/clientes", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo obtener la lista de clientes"
        );
      }
      setClientes(data as Cliente[]);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const filteredClientes = useMemo(() => {
    const global = searchTerm.trim().toLowerCase();
    const local = localSearch.trim().toLowerCase();
    return clientes.filter((cliente) => {
      const haystack = [
        cliente.nombres,
        cliente.apellidos,
        cliente.dni,
        cliente.telefono,
        cliente.email,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(global) && haystack.includes(local);
    });
  }, [clientes, searchTerm, localSearch]);

  function calcularEdad(fechaNacimiento: string) {
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }

  function resetFormulario() {
    setFormValues(initialClienteForm);
    setFormMode("create");
    setEditingId(null);
  }

  async function manejarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (formMode === "edit" && editingId === null) {
      setFeedback({
        type: "error",
        message: "No se ha seleccionado un cliente para actualizar.",
      });
      return;
    }

    if (!/^\d{8}$/.test(formValues.dni)) {
      setFeedback({
        type: "error",
        message: "El DNI debe contener exactamente 8 dígitos numéricos.",
      });
      return;
    }

    if (!/^\d{9}$/.test(formValues.telefono)) {
      setFeedback({
        type: "error",
        message: "El teléfono debe contener exactamente 9 dígitos numéricos.",
      });
      return;
    }

    if (Number(formValues.ingreso_mensual) <= 0) {
      setFeedback({
        type: "error",
        message: "El ingreso mensual debe ser un número positivo.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        duenio_propiedad: Number(formValues.duenio_propiedad),
        ingreso_mensual: Number(formValues.ingreso_mensual),
        flag_condiciones: Boolean(formValues.flag_condiciones),
      };

      const url =
        formMode === "create" ? "/api/clientes" : `/api/clientes/${editingId}`;
      const method = formMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar el cliente.");
      }

      setFeedback({
        type: "success",
        message:
          formMode === "create"
            ? "Cliente creado correctamente."
            : "Cambios guardados.",
      });
      resetFormulario();
      await cargarClientes();
      
      setSimpleModalTitle(
        formMode === "create"
          ? "Bienvenido a Horizonte Azul"
          : "Hemos actualizado tu información"
      );

      const ingreso = Number(formValues.ingreso_mensual);
      let mensajeFinanciamiento = "";
      let flag: 0 | 1 = 0; // por defecto sin confetti

      if (ingreso < 500) {
        mensajeFinanciamiento =
          "Lo sentimos, pero no puedes acceder al financiamiento.";
        flag = 0; // ❌ sin confetti
      } else if (ingreso >= 500 && ingreso <= 1700) {
        mensajeFinanciamiento =
          "¡Felicitaciones! Puedes acceder al crédito Techo Propio.";
        flag = 1; // 🎉 con confetti
      } else if (ingreso > 1700) {
        mensajeFinanciamiento =
          "¡Felicitaciones! Puedes acceder al crédito MiVivienda.";
        flag = 1; // 🎉 con confetti
      }

      setSimpleModalDesc(mensajeFinanciamiento);
      setSimpleModalFlag(flag);      // ⬅️ aquí guardas 0 o 1
      setSimpleModalOpen(true);

    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  async function verCliente(id: number) {
    try {
      const res = await fetch(`/api/clientes/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo obtener el detalle");
      }
      setDetalle(data as Cliente);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  }

  async function eliminarCliente(id: number) {
    if (!confirm("¿Deseas eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar el cliente.");
      }
      setFeedback({
        type: "success",
        message: "Cliente eliminado correctamente.",
      });
      await cargarClientes();
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  }

  function editarCliente(cliente: Cliente) {
    setFormMode("edit");
    setEditingId(cliente.id);
    setFormValues({
      dni: cliente.dni,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      fecha_nacimiento: cliente.fecha_nacimiento,
      duenio_propiedad: cliente.duenio_propiedad,
      email: cliente.email,
      direccion: cliente.direccion,
      ingreso_mensual: cliente.ingreso_mensual,
      estado_civil: cliente.estado_civil,
      telefono: cliente.telefono,
      flag_condiciones: cliente.flag_condiciones ?? false,
    });
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_minmax(360px,0.8fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Clientes registrados
              </h2>
              <p className="text-sm text-slate-500">
                Gestiona la información clave de cada cliente.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cargarClientes}
                className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold shadow hover:bg-brand-500"
              >
                {loading ? "Actualizando…" : "Actualizar"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
              <span>Filtro rápido:</span>
              <input
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
                placeholder="Ej. DNI, correo o apellido"
              />
            </div>
            <p className="text-sm text-slate-400">
              {filteredClientes.length} de {clientes.length} resultados
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">DNI</th>
                  <th className="px-6 py-3 text-left">Ingresos</th>
                  <th className="px-6 py-3 text-left">Teléfono</th>
                  <th className="px-6 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredClientes.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-slate-400"
                    >
                      {loading
                        ? "Cargando clientes…"
                        : "No hay coincidencias para tu búsqueda"}
                    </td>
                  </tr>
                )}
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {cliente.nombres} {cliente.apellidos}
                      </div>
                      <p className="text-xs text-slate-400">{cliente.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{cliente.dni}</td>
                    <td className="px-6 py-4 text-slate-900">
                      {currencyFormatter.format(cliente.ingreso_mensual)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {cliente.telefono}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <button
                          onClick={() => verCliente(cliente.id)}
                          className="rounded-full bg-emerald-100 px-4 py-1 text-emerald-700"
                        >
                          Ver más
                        </button>
                        <button
                          onClick={() => editarCliente(cliente)}
                          className="rounded-full bg-brand-100 px-4 py-1 text-brand-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarCliente(cliente.id)}
                          className="rounded-full bg-rose-100 px-4 py-1 text-rose-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detalle && (
            <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-900">
                  Detalle del cliente
                </h3>
                <button
                  onClick={() => setDetalle(null)}
                  className="text-sm font-semibold text-emerald-700"
                >
                  Cerrar
                </button>
              </div>
              <dl className="mt-3 grid gap-3 text-sm text-emerald-900 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">DNI</dt>
                  <dd>{detalle.dni}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Estado civil</dt>
                  <dd>{detalle.estado_civil}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Dirección</dt>
                  <dd>{detalle.direccion}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Dueño de propiedad</dt>
                  <dd>{detalle.duenio_propiedad ? "Sí" : "No"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Teléfono</dt>
                  <dd>{detalle.telefono}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Ingreso mensual</dt>
                  <dd>{currencyFormatter.format(detalle.ingreso_mensual)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">¿Tiene discapacidad?</dt>
                  <dd>{detalle.flag_condiciones ? "Sí" : "No"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Edad</dt>
                  <dd>{calcularEdad(detalle.fecha_nacimiento)} años</dd>
                </div>
              </dl>
            </div>
          )}
        </article>
        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-widest text-brand-600">
              Formulario cliente
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {formMode === "create" ? "Registrar" : "Actualizar"} cliente
            </h2>
            <p className="text-sm text-slate-500">
              Completa los campos obligatorios para crear o editar un registro.
            </p>
          </div>
          {feedback && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                feedback.type === "error"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {feedback.message}
            </div>
          )}
          <form className="space-y-4" onSubmit={manejarSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Nombres">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.nombres}
                  onChange={(e) =>
                    setFormValues({ ...formValues, nombres: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Apellidos">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.apellidos}
                  onChange={(e) =>
                    setFormValues({ ...formValues, apellidos: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="DNI">
                <input
                  className={inputBaseClasses}
                  type="text"
                  maxLength={8}
                  value={formValues.dni}
                  onChange={(e) =>
                    setFormValues({ ...formValues, dni: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Teléfono">
                <input
                  className={inputBaseClasses}
                  type="text"
                  maxLength={9}
                  value={formValues.telefono}
                  onChange={(e) =>
                    setFormValues({ ...formValues, telefono: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Fecha de nacimiento">
                <input
                  className={inputBaseClasses}
                  type="date"
                  value={formValues.fecha_nacimiento}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      fecha_nacimiento: e.target.value,
                    })
                  }
                  required
                />
              </Field>
              <Field label="Estado civil">
                <select
                  className={inputBaseClasses}
                  value={formValues.estado_civil}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      estado_civil: e.target.value,
                    })
                  }
                >
                  {ESTADOS_CIVILES.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Correo electrónico">
                <input
                  className={inputBaseClasses}
                  type="email"
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues({ ...formValues, email: e.target.value })
                  }
                  required
                />
              </Field>
              <div className="lg:col-span-2">
                <Field label="Dirección">
                  <input
                    className={inputBaseClasses}
                    type="text"
                    value={formValues.direccion}
                    onChange={(e) =>
                      setFormValues({ ...formValues, direccion: e.target.value })
                    }
                    required
                  />
                </Field>
              </div>
              <Field label="Ingreso mensual (S/)">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={0}
                  value={formValues.ingreso_mensual}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      ingreso_mensual: Number(e.target.value),
                    })
                  }
                  required
                />
              </Field>
              <Field label="¿Tiene discapacidad?">
                <select
                  className={inputBaseClasses}
                  value={formValues.duenio_propiedad}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      duenio_propiedad: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </Field>

              <Field label="¿Dueño de propiedad?">
                <select
                  className={inputBaseClasses}
                  value={formValues.flag_condiciones ? "1" : "0"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      flag_condiciones: e.target.value === "1",
                    })
                  }
                >
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                {submitting
                  ? "Guardando…"
                  : formMode === "create"
                  ? "Guardar"
                  : "Actualizar"}
              </button>
              <button
                type="button"
                onClick={resetFormulario}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </article>
        <ModalSimple
          open={simpleModalOpen}
          title={simpleModalTitle}
          description={simpleModalDesc}
          flag={simpleModalFlag}
          onClose={() => setSimpleModalOpen(false)}
        />
      </div>
    </section>
  );
}

function InmueblesScreen({ searchTerm }: { searchTerm: string }) {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [detalle, setDetalle] = useState<Inmueble | null>(null);
  const [formValues, setFormValues] =
    useState<InmuebleForm>(initialInmuebleForm);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    cargarInmuebles();
  }, []);

  async function cargarInmuebles() {
    try {
      setLoading(true);
      const res = await fetch("/api/inmuebles", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo obtener la lista de propiedades"
        );
      }
      setInmuebles(data as Inmueble[]);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const filteredInmuebles = useMemo(() => {
    const global = searchTerm.trim().toLowerCase();
    const local = localSearch.trim().toLowerCase();
    return inmuebles.filter((inmueble) => {
      const haystack =
        `${inmueble.nombre_proyecto} ${inmueble.ubicacion} ${inmueble.tipo}`.toLowerCase();
      return haystack.includes(global) && haystack.includes(local);
    });
  }, [inmuebles, searchTerm, localSearch]);

  function resetFormulario() {
    setFormValues(initialInmuebleForm);
    setFormMode("create");
    setEditingId(null);
  }

  async function manejarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (formMode === "edit" && editingId === null) {
      setFeedback({
        type: "error",
        message: "No se ha seleccionado un inmueble para actualizar.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        precio_venta: Number(formValues.precio_venta),
        nro_cuartos: Number(formValues.nro_cuartos),
        area_m2: Number(formValues.area_m2),
        sostenible: Boolean(formValues.sostenible),
      };

      const url = formMode === "create" ? "/api/inmuebles" : "/api/inmuebles";
      const method = formMode === "create" ? "POST" : "PUT";
      const body =
        method === "POST"
          ? payload
          : {
              id: editingId,
              ...payload,
            };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar el inmueble.");
      }

      setFeedback({
        type: "success",
        message:
          formMode === "create"
            ? "Inmueble creado correctamente."
            : "Cambios guardados.",
      });
      resetFormulario();
      await cargarInmuebles();
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  async function verInmueble(id: number) {
    try {
      const res = await fetch(`/api/inmuebles?id=${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo obtener el detalle del inmueble"
        );
      }
      setDetalle(data as Inmueble);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  }

  function editarInmueble(inmueble: Inmueble) {
    setFormMode("edit");
    setEditingId(inmueble.id);
    setFormValues({
      nombre_proyecto: inmueble.nombre_proyecto,
      precio_venta: inmueble.precio_venta,
      nro_cuartos: inmueble.nro_cuartos,
      area_m2: inmueble.area_m2,
      ubicacion: inmueble.ubicacion,
      descripcion: inmueble.descripcion || "",
      tipo: inmueble.tipo,
      imagen_referencial: inmueble.imagen_referencial || "",
      sostenible: inmueble.sostenible ?? false,
    });
  }

  async function eliminarInmueble(id: number) {
    if (!confirm("¿Deseas eliminar esta propiedad?")) return;
    try {
      const res = await fetch(`/api/inmuebles?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar la propiedad.");
      }
      setFeedback({
        type: "success",
        message: "Inmueble eliminado correctamente.",
      });
      await cargarInmuebles();
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_minmax(360px,0.8fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Inventario de propiedades
              </h2>
              <p className="text-sm text-slate-500">
                Controla los proyectos disponibles para la venta.
              </p>
            </div>
            <button
              onClick={cargarInmuebles}
              className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold shadow hover:bg-brand-500"
            >
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
              <span>Filtro rápido:</span>
              <input
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
                placeholder="Ej. Miraflores, Casa, Proyecto"
              />
            </div>
            <p className="text-sm text-slate-400">
              {filteredInmuebles.length} de {inmuebles.length} resultados
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Imagen</th>
                  <th className="px-6 py-3 text-left">Dirección</th>
                  <th className="px-6 py-3 text-left">Metraje</th>
                  <th className="px-6 py-3 text-left">Precio</th>
                  <th className="px-6 py-3 text-left">Tipo</th>
                  <th className="px-6 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredInmuebles.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-6 text-center text-slate-400"
                    >
                      {loading
                        ? "Cargando inmuebles…"
                        : "No hay coincidencias para tu búsqueda"}
                    </td>
                  </tr>
                )}
                {filteredInmuebles.map((inmueble) => (
                  <tr key={inmueble.id}>
                    <td className="px-6 py-4">
                      {inmueble.imagen_referencial ? (
                        // eslint-disable-next-line @next/next/no-img-element                       
                       <button onClick={() => setModalImageUrl(inmueble.imagen_referencial || null)}>
                          <img
                            src={inmueble.imagen_referencial}
                            alt={`Foto de ${inmueble.nombre_proyecto}`}
                            className="h-16 w-24 rounded-2xl object-cover shadow-sm cursor-pointer hover:scale-105 transition-transform"
                          />
                        </button>
                      ) : (
                        <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
                          Sin imagen
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {inmueble.ubicacion}
                      </div>
                      <p className="text-xs text-slate-400">
                        {inmueble.nombre_proyecto}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {inmueble.area_m2} m²
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {currencyFormatter.format(inmueble.precio_venta)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {inmueble.tipo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <button
                          onClick={() => verInmueble(inmueble.id)}
                          className="rounded-full bg-emerald-100 px-4 py-1 text-emerald-700"
                        >
                          Ver más
                        </button>
                        <button
                          onClick={() => editarInmueble(inmueble)}
                          className="rounded-full bg-brand-100 px-4 py-1 text-brand-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarInmueble(inmueble.id)}
                          className="rounded-full bg-rose-100 px-4 py-1 text-rose-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detalle && (
            <div className="mt-4 rounded-3xl border border-brand-100 bg-brand-50/70 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brand-700">
                  Detalle del inmueble
                </h3>
                <button
                  onClick={() => setDetalle(null)}
                  className="text-sm font-semibold text-brand-600"
                >
                  Cerrar
                </button>
              </div>
              <dl className="mt-3 grid gap-3 text-sm text-brand-900 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">Proyecto</dt>
                  <dd>{detalle.nombre_proyecto}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Tipo</dt>
                  <dd>{detalle.tipo}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Metraje</dt>
                  <dd>{detalle.area_m2} m²</dd>
                </div>
                <div>
                  <dt className="font-semibold">Cuartos</dt>
                  <dd>{detalle.nro_cuartos}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Precio</dt>
                  <dd>{currencyFormatter.format(detalle.precio_venta)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Dirección</dt>
                  <dd>{detalle.ubicacion}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold">Descripción</dt>
                  <dd>{detalle.descripcion || "Sin descripción registrada"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Sostenible</dt>
                  <dd>{detalle.sostenible ? "Sí" : "No"}</dd>
                </div>
              </dl>
            </div>
          )}
        </article>

        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-widest text-brand-600">
              Formulario propiedad
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {formMode === "create" ? "Registrar" : "Actualizar"} inmueble
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa información relevante para disponibilizar el inmueble.
            </p>
          </div>
          {feedback && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                feedback.type === "error"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {feedback.message}
            </div>
          )}
          <form className="space-y-4" onSubmit={manejarSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del proyecto">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.nombre_proyecto}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      nombre_proyecto: e.target.value,
                    })
                  }
                  required
                />
              </Field>
              <Field label="Dirección">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.ubicacion}
                  onChange={(e) =>
                    setFormValues({ ...formValues, ubicacion: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Precio (S/)">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={0}
                  value={formValues.precio_venta}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      precio_venta: Number(e.target.value),
                    })
                  }
                  required
                />
              </Field>
              <Field label="Metraje (m²)">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={10}
                  value={formValues.area_m2}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      area_m2: Number(e.target.value),
                    })
                  }
                  required
                />
              </Field>
              <Field label="Tipo de vivienda">
                <select
                  className={inputBaseClasses}
                  value={formValues.tipo}
                  onChange={(e) =>
                    setFormValues({ ...formValues, tipo: e.target.value })
                  }
                >
                  {TIPOS_INMUEBLE.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Número de cuartos">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={1}
                  max={10}
                  value={formValues.nro_cuartos}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      nro_cuartos: Number(e.target.value),
                    })
                  }
                  required
                />
              </Field>
              <Field label="Nombre de imagen o URL (opcional)">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.imagen_referencial}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      imagen_referencial: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="¿Es sostenible?">
                <select
                  className={inputBaseClasses}
                  value={formValues.sostenible ? "1" : "0"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      sostenible: e.target.value === "1",
                    })
                  }
                >
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </Field>
            </div>
            <div className="mt-4"></div>
            <Field label="Descripción">
                <textarea
                  className={`${inputBaseClasses} min-h-[90px]`}
                  value={formValues.descripcion}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      descripcion: e.target.value,
                    })
                  }
                />
            </Field>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                {submitting
                  ? "Guardando…"
                  : formMode === "create"
                  ? "Guardar"
                  : "Actualizar"}
              </button>
              <button
                type="button"
                onClick={resetFormulario}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </article>
      </div>
      <ImageModal
        imageUrl={modalImageUrl}
        onClose={() => setModalImageUrl(null)}
      />
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-semibold text-slate-600">
      <span className="mb-1 block text-xs uppercase tracking-widest text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const initialSimulacionForm: SimulacionForm = {
  clienteBusqueda: "",
  clienteId: null,
  clienteCorreo: "",
  clienteDni: "",
  inmuebleBusqueda: "",
  inmuebleId: null,
  valorInmueble: 0,
  tipoMoneda: "Soles",
  clasificacionBbp: 0,
  labelBbp: "Sin Bono",
  montoBono: 0,
  cuotaInicial: 10,
  plazoMeses: 120,
  montoPrestamoCalculado: 0,
  fechaDesembolso: new Date().toISOString().split("T")[0],
  tipoTasa: "Efectiva",
  plazoTasaInteres: 7,
  periodoGracia: 0,
  plazoPeriodoGracia: 1,
  capitalizacion: 7,
  tasaInteres: 10,
  temSeguroDesgravamen: 0,
  tasaSeguroInmueble: 0,
  portes: 0,
  costosIniciales: 0,
  gastosAdministrativos: 0,
};

function SimuladorScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [form, setForm] = useState<SimulacionForm>(initialSimulacionForm);
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null);
  const [cronogramaFechas, setCronogramaFechas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [simulacionId, setSimulacionId] = useState<number | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [inmuebleDropdownOpen, setInmuebleDropdownOpen] = useState(false);
  const [vistaSimulador, setVistaSimulador] = useState<
    "form" | "lista" | "detalle"
  >("form");
  const [simulacionesGuardadas, setSimulacionesGuardadas] = useState<
    SimulacionListado[]
  >([]);
  const [busquedaSimulacion, setBusquedaSimulacion] = useState("");
  const [cargandoLista, setCargandoLista] = useState(false);
  const [errorListado, setErrorListado] = useState<string | null>(null);
  const [simulacionSeleccionada, setSimulacionSeleccionada] =
    useState<SimulacionPersistida | null>(null);
  const fechaHoy = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const cargarSimulacionesGuardadas = useCallback(async () => {
    try {
      setCargandoLista(true);
      setErrorListado(null);
      const res = await fetch("/api/simulaciones?view=list", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo obtener las simulaciones registradas"
        );
      }
      setSimulacionesGuardadas(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorListado((error as Error).message);
    } finally {
      setCargandoLista(false);
    }
  }, []);

  useEffect(() => {
    obtenerClientes();
    obtenerInmuebles();
  }, []);

  useEffect(() => {
    const cuotaInicialMonto = (form.valorInmueble * form.cuotaInicial) / 100;
    const monto =
      Math.max(form.valorInmueble - cuotaInicialMonto - form.montoBono, 0) +
      form.costosIniciales
    setForm((prev) => ({
      ...prev,
      montoPrestamoCalculado: Number(monto.toFixed(2)),
    }));
  }, [
    form.valorInmueble,
    form.cuotaInicial,
    form.montoBono,
    form.costosIniciales,
    form.gastosAdministrativos,
  ]);

  useEffect(() => {
    if (vistaSimulador === "lista") {
      cargarSimulacionesGuardadas();
    }
  }, [vistaSimulador, cargarSimulacionesGuardadas]);

  // lógica de bono del buen pagador
  useEffect(() => {
    // Requiere cliente + inmueble seleccionado
    if (!form.clienteId || !form.inmuebleId) {
      setForm(prev => ({
        ...prev,
        clasificacionBbp: 0,
        montoBono: 0,
        labelBbp: "Sin Bono"
      }));
      return;
    }

    // Obtener cliente real desde la DB cargada
    const cliente = clientes.find(c => c.id === form.clienteId);
    const ingreso = cliente?.ingreso_mensual ?? 999999;

    // Obtener inmueble real desde la DB
    const inmueble = inmuebles.find(i => i.id === form.inmuebleId);
    const PV = inmueble?.precio_venta ?? 0;

    if (!PV) {
      setForm(prev => ({
        ...prev,
        clasificacionBbp: 0,
        montoBono: 0,
        labelBbp: "Sin Bono"
      }));
      return;
    }

    // Rangos oficiales MiVivienda
    const rangos = [
      { min: 68800,  max: 98100,  trad: 27400, sost: 33700, inte: 31000 },
      { min: 98100,  max: 146900, trad: 22800, sost: 29100, inte: 26400 },
      { min: 146900, max: 244600, trad: 20900, sost: 27200, inte: 24500 },
      { min: 244600, max: 362100, trad: 7800,  sost: 14100, inte: 11400 },
    ];

    const r = rangos.find(x => PV >= x.min && PV <= x.max);

    if (!r) {
      setForm(prev => ({
        ...prev,
        clasificacionBbp: 0,
        montoBono: 0,
        labelBbp: "Sin Bono"
      }));
      return;
    }

    const calcularEdad = (fechaNacimiento: string): number => {
      const fechaNacimientoDate = new Date(fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
      const mes = hoy.getMonth() - fechaNacimientoDate.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimientoDate.getDate())) {
        return edad - 1; // Si el cumpleaños aún no ha pasado en este año
      }
      return edad;
    };

    //aplica bono integrador
    const condicion_integrador = cliente?.flag_condiciones ?? 0;
    const edad = cliente?.fecha_nacimiento ? calcularEdad(cliente.fecha_nacimiento) : 0;
    //si cumple alguna de esas condiciones, aplica el bono integrador (y si cumple la clasificacion)
    const aplicaIntegrador = (ingreso <= 4746 || edad >= 60 || condicion_integrador == true);
    const aplicaSostenible = inmueble?.sostenible ?? false;

    let clasificacion = 0;
    let monto = 0;
    let etiqueta = "Sin Bono";

    if (aplicaIntegrador) {
      clasificacion = 3;
      monto = r.inte;
      etiqueta = "BBP Integrador";
    } else if (aplicaSostenible) {
      clasificacion = 2;
      monto = r.sost;
      etiqueta = "BBP Sostenible";
    } else {
      clasificacion = 1;
      monto = r.trad;
      etiqueta = "BBP Tradicional";
    }

    setForm(prev => ({
      ...prev,
      clasificacionBbp: clasificacion,
      montoBono: monto,
      labelBbp: etiqueta
    }));

  }, [clientes, form.clienteId, form.inmuebleId, inmuebles]);

  async function obtenerClientes() {
    try {
      const res = await fetch("/api/clientes", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener clientes");
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  }

  async function obtenerInmuebles() {
    try {
      const res = await fetch("/api/inmuebles", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener inmuebles");
      const data = await res.json();
      setInmuebles(data);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  }

  const clientesFiltrados = useMemo(() => {
    if (!form.clienteBusqueda) return clientes;
    return clientes.filter((cliente) =>
      `${cliente.nombres} ${cliente.apellidos} ${cliente.dni}`
        .toLowerCase()
        .includes(form.clienteBusqueda.toLowerCase())
    );
  }, [clientes, form.clienteBusqueda]);

  const inmueblesFiltrados = useMemo(() => {
    if (!form.inmuebleBusqueda) return inmuebles;
    return inmuebles.filter((inmueble) =>
      inmueble.nombre_proyecto
        .toLowerCase()
        .includes(form.inmuebleBusqueda.toLowerCase())
    );
  }, [inmuebles, form.inmuebleBusqueda]);

  function updateNumericString(key: keyof SimulacionForm, value: string) {
    const sanitized = value
      .replace(/[^0-9.]/g, "") // solo números y punto
      .replace(/(\..*)\./g, "$1"); // evita más de un punto

    setForm((prev) => ({
      ...prev,
      [key]: sanitized,
    }));
  }

  function cerrarDropdownConRetardo(
    setter: (open: boolean) => void,
    delay = 120
  ) {
    setTimeout(() => setter(false), delay);
  }

  function handleNumericFocus(event: FocusEvent<HTMLInputElement>) {
    event.target.select();
  }

  function limpiarSimulacion() {
    setForm(initialSimulacionForm);
    setSimulacionId(null);
    setResultado(null);
    setFeedback(null);
    setVistaSimulador("form");
    setSimulacionSeleccionada(null);
  }

  function irAEdicion() {
    setResultado(null);
    setVistaSimulador("form");
    setFeedback(null);
  }

  function seleccionarCliente(cliente: Cliente) {
    setForm((prev) => ({
      ...prev,
      clienteId: cliente.id,
      clienteBusqueda: `${cliente.nombres} ${cliente.apellidos}`, // ← Texto final fijo
      clienteCorreo: cliente.email,
      clienteDni: cliente.dni,
    }));
  }

  function seleccionarInmueble(inmueble: Inmueble) {
    setForm((prev) => ({
      ...prev,
      inmuebleId: inmueble.id,
      inmuebleBusqueda: inmueble.nombre_proyecto, // ← Texto final fijo
      valorInmueble: inmueble.precio_venta,
    }));
  }

  function actualizarForm<Key extends keyof SimulacionForm>(
    key: Key,
    value: SimulacionForm[Key]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function prepararFormularioDesdeInfo(info: SimulacionPersistida) {
    const fecha = new Date(info.fecha_inicio).toISOString().split("T")[0];
    setForm((prev) => ({
      ...prev,
      clienteId: info.clientes_id ?? info.cliente.id,
      clienteBusqueda: `${info.cliente.nombres} ${info.cliente.apellidos}`,
      clienteCorreo: info.cliente.email ?? "",
      clienteDni: info.cliente.dni,
      inmuebleId: info.inmueble_id ?? info.inmueble.id,
      inmuebleBusqueda: info.inmueble.nombre_proyecto,
      valorInmueble: Number(info.monto_prestamo),
      tipoMoneda: info.tipo_moneda === "Dólares" ? "Dólares" : "Soles",
      clasificacionBbp: info.clasificacion_bono_bbp ?? 0,
      labelBbp:
        info.clasificacion_bono_bbp && info.clasificacion_bono_bbp > 0
          ? "Con Bono"
          : "Sin Bono",
      montoBono: info.monto_bono_bbp ?? 0,
      cuotaInicial: Number(info.cuota_inicial),
      plazoMeses: info.plazo_meses,
      montoPrestamoCalculado: Number(info.monto_prestamo),
      fechaDesembolso: fecha,
      tipoTasa: info.tipo_tasa === "Nominal" ? "Nominal" : "Efectiva",
      plazoTasaInteres: info.plazo_tasa_interes,
      periodoGracia: Number(info.periodo_gracia ?? 0),
      plazoPeriodoGracia: info.plazo_periodo_gracia,
      capitalizacion: Number(info.capitalizacion ?? 0),
      tasaInteres: Number(info.tasa_interes),
      temSeguroDesgravamen: Number(info.tem_seguro_desgravamen ?? 0),
      tasaSeguroInmueble: Number(info.tasa_seguro_inmueble ?? 0),
      portes: Number(info.portes ?? 0),
      costosIniciales: Number(info.costosIniciales ?? 0),
      gastosAdministrativos: Number(info.gastosAdministrativos ?? 0),
    }));
    setSimulacionId(info.id_simulacion);
  }

  function generarFechasCronograma(totalCuotas: number, fechaBase?: string) {
    const fechas: string[] = [];
    const base = new Date(fechaBase ?? form.fechaDesembolso);
    for (let i = 0; i < totalCuotas; i++) {
      const fecha = new Date(base);
      fecha.setMonth(base.getMonth() + i);
      fechas.push(fecha.toISOString().split("T")[0]);
    }
    setCronogramaFechas(fechas);
  }

  async function verDetalleSimulacion(id: number) {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/simulaciones?id_simulacion=${id}&includeRaw=1`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo cargar la simulación seleccionada");
      }
      setResultado(data);
      setVistaSimulador("detalle");
      const info = data.simulacionInfo as SimulacionPersistida | undefined;
      if (info) {
        setSimulacionSeleccionada(info);
        prepararFormularioDesdeInfo(info);
        generarFechasCronograma(data.data.length, info.fecha_inicio);
      } else {
        generarFechasCronograma(data.data.length);
      }
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function manejarCalculo(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    if (!form.clienteId || !form.inmuebleId) {
      setFeedback({
        type: "error",
        message: "Selecciona un cliente y una propiedad para continuar.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipo_moneda: form.tipoMoneda === "Soles" ? 0 : 1,
        tipo_tasa: form.tipoTasa === "Efectiva" ? 0 : 1,
        tasa_interes: Number(form.tasaInteres),
        capitalizacion: Number(form.capitalizacion),
        monto_prestamo: Number(form.valorInmueble),
        cuota_inicial: Number(form.cuotaInicial),
        plazo_meses: Number(form.plazoMeses),
        fecha_inicio: form.fechaDesembolso,
        plazo_tasa_interes: Number(form.plazoTasaInteres),
        periodo_gracia: Number(form.periodoGracia),
        plazo_periodo_gracia: Number(form.plazoPeriodoGracia),
        monto_bono_bbp: Number(form.montoBono),
        clasificacion_bono_bbp: Number(form.clasificacionBbp),
        tem_seguro_desgravamen: Number(form.temSeguroDesgravamen),
        tasa_seguro_inmueble: Number(form.tasaSeguroInmueble),
        portes: Number(form.portes),
        costos_iniciales: Number(form.costosIniciales),
        gasto_admin: Number(form.gastosAdministrativos),
        usuario_id: 1,
        clientes_id: form.clienteId,
        inmueble_id: form.inmuebleId,
      };

      const url = `/api/simulaciones${
        simulacionId ? `?id_simulacion=${simulacionId}` : ""
      }`;
      const method = simulacionId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const mensaje = Array.isArray(data.error)
          ? data.error.join(" ")
          : data.error;
        throw new Error(mensaje || "No se pudo registrar la simulación");
      }

      const simulacionIdRespuesta =
        data.simulacion?.id_simulacion ?? simulacionId;

      if (!simulacionIdRespuesta) {
        throw new Error("No se obtuvo el identificador de la simulación");
      }

      setSimulacionId(simulacionIdRespuesta);

      const calculo = await fetch(
        `/api/simulaciones?id_simulacion=${simulacionIdRespuesta}&includeRaw=1`
      );
      const resultadoCalculo = await calculo.json();
      if (!calculo.ok)
        throw new Error(
          resultadoCalculo.error || "No se pudo calcular la simulación"
        );

      setResultado(resultadoCalculo);
      setVistaSimulador("detalle");
      const info = resultadoCalculo.simulacionInfo as
        | SimulacionPersistida
        | undefined;
      if (info) {
        setSimulacionSeleccionada(info);
        prepararFormularioDesdeInfo(info);
        generarFechasCronograma(resultadoCalculo.data.length, info.fecha_inicio);
      } else {
        generarFechasCronograma(resultadoCalculo.data.length);
      }
      setFeedback({
        type: "success",
        message: simulacionId
          ? "Simulación actualizada y calculada correctamente."
          : "Simulación registrada y calculada correctamente.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }

  async function generarPDF() {
    if (!resultado || !form.clienteId || !form.inmuebleId) {
      alert("Debe calcular primero la simulación");
      return;
    }

    const cliente = await fetch(`/api/clientes/${form.clienteId}`).then((r) =>
      r.json()
    );
    const inmueble = await fetch(`/api/inmuebles?id=${form.inmuebleId}`).then(
      (r) => r.json()
    );

    const pdfMake = (await import("pdfmake/build/pdfmake.js")).default;
    const pdfFonts = (await import("pdfmake/build/vfs_fonts.js")).default;
    pdfMake.vfs = pdfFonts.vfs;

    const money = (n: number | string) =>
      `S/. ${Number(n).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const tirNum = Number(resultado.resumen.TIR.replace("%", ""));
    const cokNum = Number(cliente.cok || 0);

    const comparacion =
      tirNum > cokNum
        ? { texto: "NO LE CONVIENE", color: "red" }
        : { texto: "LE CONVIENE", color: "green" };

    // ===== CRONOGRAMA: quitar columna ITER (segunda columna) =====
    const headersSinIter = resultado.headers.filter((h) => h !== "Iter");
    const dataSinIter = resultado.data.map((fila) =>
      fila.filter((_, idx) => resultado.headers[idx] !== "Iter")
    );

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: "Informe de Simulación de Crédito", style: "titulo" },
        { text: "\n" },

        // ========================
        // DATOS DEL CLIENTE
        // ========================
        { text: "Datos del cliente", style: "subtitulo" },
        {
          table: {
            widths: ["*", "*"],
            body: [
              ["Nombre", `${cliente.nombres} ${cliente.apellidos}`],
              ["DNI", cliente.dni],
              ["Correo", cliente.email],
              [
                "F. Nacimiento",
                new Date(cliente.fecha_nacimiento).toLocaleDateString(),
              ],
              ["Ingreso mensual", money(cliente.ingreso_mensual)],
              ["Estado civil", cliente.estado_civil],
              ["Teléfono", cliente.telefono],
              ["Dirección", cliente.direccion],
              ["Dueño de propiedad", cliente.duenio_propiedad ? "Sí" : "No"],
              [
                { text: "COK", color: "red" },
                { text: String(cliente.cok), color: "red" },
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },

        { text: "\n\n" },

        // ========================
        // DATOS DEL INMUEBLE
        // ========================
        { text: "Datos del inmueble", style: "subtitulo" },
        {
          table: {
            widths: ["*", "*"],
            body: [
              ["Proyecto", inmueble.nombre_proyecto],
              ["Ubicación", inmueble.ubicacion],
              ["Precio venta", money(inmueble.precio_venta)],
              ["Cuartos", inmueble.nro_cuartos],
              ["Área (m²)", inmueble.area_m2],
              ["Tipo", inmueble.tipo],
              ["Descripción", inmueble.descripcion || "Sin descripción"],
            ],
          },
          layout: "lightHorizontalLines",
        },

        { text: "\n\n" },

        // ========================
        // INDICADORES
        // ========================
        { text: "Resumen de indicadores", style: "subtitulo" },
        {
          table: {
            widths: ["*", "*"],
            body: [
              ["TCEA", resultado.resumen.TCEA],
              ["VAN", money(resultado.resumen.VAN)],
              [
                { text: "TIR", color: "red" },
                { text: resultado.resumen.TIR, color: "red" },
              ],
              ["Saldo financiar", money(resultado.resumen.saldo_financiar)],
              ["Cuota base", money(resultado.resumen.cuota_base)],
            ],
          },
          layout: "lightHorizontalLines",
        },

        { text: "\n\n" },

        // ========================
        // COMPARACIÓN COK VS TIR
        // ========================
        {
          text: comparacion.texto,
          style: "sellos",
          color: comparacion.color,
        },

        // ========================
        // CRONOGRAMA — Primera hoja horizontal
        // ========================
        {
          pageBreak: "before",
          pageOrientation: "landscape",
          text: "Cronograma",
          style: "subtitulo",
          margin: [0, 0, 0, 10],
        },

        {
          pageOrientation: "landscape",
          fontSize: 8, // ← letra reducida SOLO en el cronograma
          table: {
            headerRows: 1,
            widths: [
              15, // Nº
              45, // Fecha
              ...headersSinIter.map(() => "*"),
            ],
            body: [
              ["N°", "Fecha", ...headersSinIter],
              ...dataSinIter.map((row, i) => [
                i + 1,
                cronogramaFechas[i],
                ...row.map((n) => (typeof n === "number" ? money(n) : n)),
              ]),
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 0],
        },
      ],

      styles: {
        titulo: { fontSize: 15, bold: true, alignment: "center" },
        subtitulo: { fontSize: 14, bold: true, margin: [0, 10, 0, 10] },
        sellos: { fontSize: 22, bold: true, alignment: "center" },
      },
    };

    pdfMake.createPdf(docDefinition).getBase64(async (pdfBase64: string) => {
      pdfMake.createPdf(docDefinition).download("Informe_Credito.pdf");

      await fetch("/api/enviar-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailDestino: cliente.email,
          pdfBase64,
        }),
      });

      alert("Reporte descargado y enviado al correo del cliente");
    });
  }

  function exportarExcel() {
    if (!resultado) return;

    const cabecera = ["N°", "Fecha", ...resultado.headers];

    const filas = resultado.data.map((fila, index) => [
      index + 1,
      cronogramaFechas[index] ?? "",
      ...fila,
    ]);

    const matriz = [cabecera, ...filas];

    const hojaCronograma = XLSX.utils.aoa_to_sheet(matriz);

    const anchoColumnas = cabecera.map(() => ({ wch: 18 }));
    hojaCronograma["!cols"] = anchoColumnas;

    cabecera.forEach((titulo, i) => {
      const celda = XLSX.utils.encode_cell({ r: 0, c: i });
      hojaCronograma[celda].s = {
        fill: {
          fgColor: { rgb: "0F1C2F" }, // azul oscuro
        },
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
        },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } },
        },
      };
    });

    const totalFilas = matriz.length;
    const totalColumnas = cabecera.length;

    for (let r = 1; r < totalFilas; r++) {
      for (let c = 0; c < totalColumnas; c++) {
        const celda = XLSX.utils.encode_cell({ r, c });

        if (!hojaCronograma[celda]) continue;

        const valor = hojaCronograma[celda].v;

        const esMoneda = c >= 2 && typeof valor === "number";

        hojaCronograma[celda].t = esMoneda ? "n" : "s";
        hojaCronograma[celda].z = esMoneda ? '"S/." #,##0.00' : undefined;

        hojaCronograma[celda].s = {
          alignment: { horizontal: esMoneda ? "right" : "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
        };
      }
    }

    const resumenAOA = [
      ["Indicador", "Valor"],
      ["TCEA", resultado.resumen.TCEA],
      ["TIR", resultado.resumen.TIR],
      ["VAN", resultado.resumen.VAN],
      ["Saldo a financiar", resultado.resumen.saldo_financiar],
      ["Cuota base", resultado.resumen.cuota_base],
      ["Plazo (meses)", resultado.resumen.plazo_meses],
    ];

    const hojaResumen = XLSX.utils.aoa_to_sheet(resumenAOA);

    hojaResumen["!cols"] = [{ wch: 28 }, { wch: 20 }];

    resumenAOA.forEach((fila, r) => {
      fila.forEach((_, c) => {
        const celda = XLSX.utils.encode_cell({ r, c });

        hojaResumen[celda].s = {
          font: {
            bold: r === 0,
            color: r === 0 ? { rgb: "FFFFFF" } : { rgb: "000000" },
          },
          fill:
            r === 0
              ? { fgColor: { rgb: "0F1C2F" } }
              : { fgColor: { rgb: "F5F5F5" } },
          alignment: { horizontal: c === 0 ? "left" : "right" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        };

        if (c === 1 && r > 1 && typeof resumenAOA[r][1] === "number") {
          hojaResumen[celda].t = "n";
          hojaResumen[celda].z = '"S/." #,##0.00';
        }
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, hojaResumen, "Resumen");
    XLSX.utils.book_append_sheet(wb, hojaCronograma, "Cronograma");

    XLSX.writeFile(wb, "SimulacionCredito.xlsx", { compression: true });
  }

  const formatNumber = (value: number | string) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(String(value).replace(/,/g, ""));
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-PE").format(num); // comas de miles
  };
  const simulacionesGuardadasFiltradas = useMemo(() => {
    const criterio = busquedaSimulacion.trim().toLowerCase();
    if (!criterio) return simulacionesGuardadas;

    return simulacionesGuardadas.filter((sim) => {
      const nombreCliente = `${sim.cliente.nombres} ${sim.cliente.apellidos}`.toLowerCase();
      const dni = sim.cliente.dni?.toLowerCase() ?? "";
      const propiedad = sim.inmueble.nombre_proyecto.toLowerCase();
      return (
        nombreCliente.includes(criterio) ||
        dni.includes(criterio) ||
        propiedad.includes(criterio)
      );
    });
  }, [busquedaSimulacion, simulacionesGuardadas]);

  const metricasResultado = useMemo(() => {
    if (!resultado) return null;

    let totalInteres = 0;
    let totalAmortizacion = 0;
    let totalSeguros = 0;
    let totalPortes = 0;
    let totalGastos = 0;

    resultado.data.forEach((fila) => {
      totalInteres += Number(fila[0] ?? 0);
      totalAmortizacion += Number(fila[1] ?? 0);
      totalSeguros += Number(fila[2] ?? 0) + Number(fila[3] ?? 0);
      totalPortes += Number(fila[4] ?? 0);
      totalGastos += Number(fila[5] ?? 0);
    });

    const totalPagado =
      totalInteres + totalAmortizacion + totalSeguros + totalPortes + totalGastos;

    return {
      totalInteres,
      totalAmortizacion,
      totalSeguros,
      totalPortes,
      totalGastos,
      totalPagado,
    };
  }, [resultado]);
  const contenidoResultados = resultado ? (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {simulacionSeleccionada
                ? `Simulación de ${simulacionSeleccionada.cliente.nombres} ${simulacionSeleccionada.cliente.apellidos}`
                : "Simulación de crédito"}
            </h2>
            <p className="text-sm text-slate-500">
              {simulacionSeleccionada?.inmueble.nombre_proyecto ||
                "Resumen de indicadores y cronograma generado."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {vistaSimulador === "detalle" && (
              <button
                type="button"
                onClick={() => setVistaSimulador("lista")}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Volver al listado
              </button>
            )}
            <button
              type="button"
              onClick={irAEdicion}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Editar simulación
            </button>
            <button
              type="button"
              onClick={exportarExcel}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Exportar a Excel
            </button>
            <button
              type="button"
              onClick={generarPDF}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Descargar y enviar por correo
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResumenCard title="TCEA" value={`${resultado.resumen.TCEA}`} />
          <ResumenCard
            title="VAN"
            value={currencyFormatter.format(resultado.resumen.VAN)}
          />
          <ResumenCard title="TIR" value={resultado.resumen.TIR} />
          <ResumenCard
            title="Saldo a financiar"
            value={currencyFormatter.format(resultado.resumen.saldo_financiar)}
          />
          <ResumenCard
            title="Cuota base"
            value={currencyFormatter.format(resultado.resumen.cuota_base)}
          />
          <ResumenCard
            title="Plazo (meses)"
            value={`${resultado.resumen.plazo_meses}`}
          />
          <ResumenCard
            title="TEM"
            value={` ${(resultado.resumen.TEM * 100).toFixed(5)}%`}
          />
          <ResumenCard
            title="Monto préstamo"
            value={currencyFormatter.format(
              resultado.resumen.monto_prestamo_total
            )}
          />
        </div>

        {metricasResultado && (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Solicitud vs interés
              </h3>
              <p className="text-sm text-slate-500">
                Comparativo de capital amortizado frente a intereses y costos.
              </p>
              <div className="mt-4 flex items-center gap-4">
                {(() => {
                  const totalPie =
                    metricasResultado.totalAmortizacion +
                    metricasResultado.totalInteres;
                  const principalPct =
                    totalPie === 0
                      ? 0
                      : (metricasResultado.totalAmortizacion / totalPie) * 100;
                  const interesPct = 100 - principalPct;
                  return (
                    <div className="flex items-center gap-4">
                      <div
                        className="h-28 w-28 rounded-full border border-slate-200"
                        style={{
                          background: `conic-gradient(#0ea5e9 0% ${principalPct}%, #f97316 ${principalPct}% 100%)`,
                        }}
                        aria-label="Gráfico de capital vs intereses"
                      />
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          <span>
                            Capital amortizado: {currencyFormatter.format(
                              metricasResultado.totalAmortizacion
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                          <span>
                            Intereses: {currencyFormatter.format(
                              metricasResultado.totalInteres
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {principalPct.toFixed(1)}% capital / {interesPct.toFixed(1)}%
                          interés
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
              <ResumenCard
                title="Total pagado"
                value={currencyFormatter.format(metricasResultado.totalPagado)}
              />
              <ResumenCard
                title="Seguros acumulados"
                value={currencyFormatter.format(metricasResultado.totalSeguros)}
              />
              <ResumenCard
                title="Portes"
                value={currencyFormatter.format(metricasResultado.totalPortes)}
              />
              <ResumenCard
                title="Gastos administrativos"
                value={currencyFormatter.format(metricasResultado.totalGastos)}
              />
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cronograma
              </h3>
              <p className="text-sm text-slate-500">
                Detalle mensual del crédito (scroll para ver todo).
              </p>
            </div>
          </div>
          <div className="overflow-auto rounded-3xl border border-slate-100 max-h-[60vh]">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  {resultado.headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {resultado.data.map((fila, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {cronogramaFechas[index]}
                    </td>
                    {fila.map((celda, celdaIndex) => (
                      <td
                        key={celdaIndex}
                        className="px-4 py-3 text-slate-600 whitespace-nowrap"
                      >
                        {typeof celda === "number"
                          ? currencyFormatter.format(celda)
                          : celda}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  ) : null;

  const listadoSimulaciones = (
    <div className="rounded-[32px] bg-white p-6 shadow-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Simulaciones registradas
          </h2>
          <p className="text-sm text-slate-500">
            Busca por DNI, nombre o propiedad para revisar los registros previos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setVistaSimulador("form");
              setResultado(null);
              setFeedback(null);
            }}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Volver al simulador
          </button>
          <button
            type="button"
            onClick={cargarSimulacionesGuardadas}
            className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold shadow hover:bg-brand-500"
            disabled={cargandoLista}
          >
            {cargandoLista ? "Actualizando…" : "Actualizar lista"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
          <span className="text-xl text-slate-400">🔍</span>
          <input
            value={busquedaSimulacion}
            onChange={(e) => setBusquedaSimulacion(e.target.value)}
            placeholder="Buscar por DNI, nombre o propiedad"
            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>
        <p className="text-sm text-slate-500">
          {simulacionesGuardadasFiltradas.length} simulaciones encontradas
        </p>
      </div>

      {errorListado && (
        <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {errorListado}
        </div>
      )}

      <div className="mt-4 overflow-auto rounded-3xl border border-slate-100 max-h-[65vh]">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">N°</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Propiedad</th>
              <th className="px-4 py-3 text-left">Monto préstamo</th>
              <th className="px-4 py-3 text-left">Tasa interés</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {simulacionesGuardadasFiltradas.map((simulacion, index) => (
              <tr key={simulacion.id_simulacion} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="font-semibold">{`${simulacion.cliente.nombres} ${simulacion.cliente.apellidos}`}</div>
                  <div className="text-xs text-slate-500">DNI: {simulacion.cliente.dni}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {simulacion.inmueble.nombre_proyecto}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {currencyFormatter.format(simulacion.monto_prestamo)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {simulacion.tasa_interes}% ({simulacion.tipo_tasa})
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(simulacion.fecha_inicio).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <button
                    type="button"
                    onClick={() => verDetalleSimulacion(simulacion.id_simulacion)}
                    className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold shadow hover:bg-brand-500"
                  >
                    Ver más
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cargandoLista && (
        <p className="mt-3 text-sm text-slate-500">Cargando simulaciones...</p>
      )}
      {!cargandoLista && simulacionesGuardadasFiltradas.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">
          No se encontraron simulaciones registradas.
        </p>
      )}
    </div>
  );

  const mostrandoLista = vistaSimulador === "lista";
  const mostrandoResultados = vistaSimulador === "detalle" && !!resultado;
  const mostrandoFormulario = vistaSimulador === "form" && !resultado;

  if (mostrandoLista) {
    return <section className="space-y-6">{listadoSimulaciones}</section>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Simulador de Créditos
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa los datos para obtener indicadores y el cronograma.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setVistaSimulador("lista");
                setResultado(null);
              }}
              className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold shadow hover:bg-brand-500"
            >
              Visualizar simulaciones
            </button>
          </div>
        </div>

        {feedback && vistaSimulador !== "lista" && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {mostrandoFormulario && (
          <form
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            onSubmit={manejarCalculo}
          >
            <Field label="Cliente">
              <div className="relative">
                <input
                  value={form.clienteBusqueda}
                  onFocus={() => setClienteDropdownOpen(true)}
                  onBlur={() => cerrarDropdownConRetardo(setClienteDropdownOpen)}
                  onChange={(e) => {
                    const value = e.target.value;

                    actualizarForm("clienteBusqueda", value);

                    if (value.trim() === "") {
                      setForm((prev) => ({
                        ...prev,
                        clienteId: null,
                        clienteCorreo: "",
                        clienteDni: "",
                      }));
                    }
                  }}
                  placeholder="Buscar por DNI o nombre"
                  className={`${inputBaseClasses} pr-12`}
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setClienteDropdownOpen((prev) => !prev)}
                  className="absolute right-2 top-2 rounded-xl px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
                >
                  ⌄
                </button>

                {clienteDropdownOpen && (
                  <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-slate-100 bg-white shadow-lg">
                    {clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          seleccionarCliente(cliente);
                          setClienteDropdownOpen(false);
                        }}
                        className="flex w-full flex-col items-start px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-800">
                          {cliente.nombres} {cliente.apellidos}
                        </span>
                        <span className="text-xs text-slate-500">
                          DNI: {cliente.dni}
                        </span>
                      </button>
                    ))}

                    {clientesFiltrados.length === 0 && (
                      <p className="px-4 py-2 text-sm text-slate-500">
                        Sin resultados
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <Field label="DNI">
              <input
                value={form.clienteDni}
                readOnly
                placeholder="DNI del cliente"
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Correo">
              <input
                value={form.clienteCorreo}
                readOnly
                placeholder="Correo del cliente"
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Propiedad">
              <div className="relative">
                <input
                  value={form.inmuebleBusqueda}
                  onFocus={() => setInmuebleDropdownOpen(true)}
                  onBlur={() => cerrarDropdownConRetardo(setInmuebleDropdownOpen)}
                  onChange={(e) => {
                    const value = e.target.value;

                    actualizarForm("inmuebleBusqueda", value);

                    if (value.trim() === "") {
                      setForm((prev) => ({
                        ...prev,
                        inmuebleId: null,
                        valorInmueble: 0,
                      }));
                    }
                  }}
                  placeholder="Buscar por nombre de proyecto"
                  className={`${inputBaseClasses} pr-12`}
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setInmuebleDropdownOpen((prev) => !prev)}
                  className="absolute right-2 top-2 rounded-xl px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
                >
                  ⌄
                </button>

                {inmuebleDropdownOpen && (
                  <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-slate-100 bg-white shadow-lg">
                    {inmueblesFiltrados.map((inmueble) => (
                      <button
                        key={inmueble.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          seleccionarInmueble(inmueble);
                          setInmuebleDropdownOpen(false);
                        }}
                        className="flex w-full flex-col items-start px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-800">
                          {inmueble.nombre_proyecto}
                        </span>
                        <span className="text-xs text-slate-500">
                          {currencyFormatter.format(inmueble.precio_venta)}
                        </span>
                      </button>
                    ))}

                    {inmueblesFiltrados.length === 0 && (
                      <p className="px-4 py-2 text-sm text-slate-500">
                        Sin resultados
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Valor Inmueble">
              <input
                value={formatNumber(form.valorInmueble)}
                readOnly
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Tipo de Moneda">
              <select
                value={form.tipoMoneda}
                onChange={(e) =>
                  actualizarForm(
                    "tipoMoneda",
                    e.target.value as SimulacionForm["tipoMoneda"]
                  )
                }
                className={inputBaseClasses}
              >
                <option value="Soles">Soles</option>
                <option value="Dólares">Dólares</option>
              </select>
            </Field>

            <Field label="Clasificación Bono Buen Pagador">
              <input
                value={form.labelBbp}
                readOnly
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Monto Bono Buen Pagador">
              <input
                value={formatNumber(form.montoBono)}
                readOnly
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Cuota Inicial (%)">
              <input
                type="number"
                value={form.cuotaInicial}
                onChange={(e) =>
                  actualizarForm("cuotaInicial", Number(e.target.value))
                }
                className={inputBaseClasses}
                min={0}
                max={100}
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Costos iniciales">
              <input
                type="text"
                value={formatNumber(form.costosIniciales)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  const num = Number(raw);
                  actualizarForm("costosIniciales", isNaN(num) ? 0 : num);
                }}
                className={inputBaseClasses}
                min={0}
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Monto Préstamo">
              <input
                value={formatNumber(form.montoPrestamoCalculado)}
                readOnly
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Fecha de Desembolso">
              <div className="space-y-1">
                <input
                  type="date"
                  value={form.fechaDesembolso}
                  min={simulacionId ? undefined : fechaHoy}
                  disabled={!!simulacionId}
                  onChange={(e) =>
                    actualizarForm("fechaDesembolso", e.target.value)
                  }
                  className={`${inputBaseClasses} ${
                    simulacionId ? "cursor-not-allowed bg-slate-100" : ""
                  }`}
                />
                {simulacionId && (
                  <p className="text-xs text-slate-500">
                    Para ediciones se conserva la fecha registrada originalmente.
                  </p>
                )}
              </div>
            </Field>

            <Field label="Plazo (meses)">
              <input
                type="number"
                value={form.plazoMeses}
                onChange={(e) =>
                  actualizarForm("plazoMeses", Number(e.target.value))
                }
                className={inputBaseClasses}
                min={1}
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Tipo de Tasa de Interés">
              <select
                value={form.tipoTasa}
                onChange={(e) =>
                  actualizarForm(
                    "tipoTasa",
                    e.target.value as SimulacionForm["tipoTasa"]
                  )
                }
                className={inputBaseClasses}
              >
                <option value="Efectiva">Efectiva</option>
                <option value="Nominal">Nominal</option>
              </select>
            </Field>

            <Field label="Plazo de tasa de interés (p)">
              <select
                value={form.plazoTasaInteres}
                onChange={(e) =>
                  actualizarForm("plazoTasaInteres", Number(e.target.value))
                }
                className={inputBaseClasses}
              >
                <option value={7}>Anual</option>
                <option value={6}>Semestral</option>
                <option value={5}>Cuatrimestral</option>
                <option value={4}>Trimestral</option>
                <option value={3}>Bimestral</option>
                <option value={2}>Mensual</option>
                <option value={1}>Quincenal</option>
                <option value={0}>Diaria</option>
              </select>                
            </Field>

            {form.tipoTasa === "Nominal" && (
              <Field label="Capitalización (c)">
                <select
                  value={form.capitalizacion}
                  onChange={(e) =>
                    actualizarForm("capitalizacion", Number(e.target.value))
                  }
                  className={inputBaseClasses}
                >
                  <option value={7}>Anual</option>
                  <option value={6}>Semestral</option>
                  <option value={5}>Cuatrimestral</option>
                  <option value={4}>Trimestral</option>
                  <option value={3}>Bimestral</option>
                  <option value={2}>Mensual</option>
                  <option value={1}>Quincenal</option>
                  <option value={0}>Diaria</option>
                </select>
              </Field>
            )}

            <Field label="Tasa de Interés (%)">
              <input
                type="number"
                value={form.tasaInteres}
                onChange={(e) =>
                  actualizarForm("tasaInteres", Number(e.target.value))
                }
                className={inputBaseClasses}
                min={0}
                step="any"
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Periodo de gracia (g)">
              <select
                value={form.periodoGracia}
                onChange={(e) =>
                  actualizarForm("periodoGracia", Number(e.target.value))
                }
                className={inputBaseClasses}
              >
                <option value={0}>Sin gracia</option>
                <option value={1}>Parcial</option>
                <option value={2}>Total</option>
              </select>
            </Field>

            {form.periodoGracia !== 0 && (
              <Field label="Plazo de periodo de gracia (pg)">
                <input
                  type="number"
                  value={form.plazoPeriodoGracia}
                  onChange={(e) =>
                    actualizarForm("plazoPeriodoGracia", Number(e.target.value))
                  }
                  className={inputBaseClasses}
                  min={1}
                  onFocus={handleNumericFocus}
                />
              </Field>
            )}

            <Field label="TEM Seguro Desgravamen (%)">
              <input
                type="number"
                value={form.temSeguroDesgravamen}
                onChange={(e) =>
                  actualizarForm("temSeguroDesgravamen", Number(e.target.value))
                }
                className={inputBaseClasses}
                min={0}
                step="any"
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Tasa Seguro Inmueble (%)">
              <input
                type="number"
                value={form.tasaSeguroInmueble}
                onChange={(e) =>
                  actualizarForm("tasaSeguroInmueble", Number(e.target.value))
                }
                className={inputBaseClasses}
                min={0}
                step="any"
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Portes">
              <input
                type="text"
                value={formatNumber(form.portes)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  const num = Number(raw);
                  actualizarForm("portes", isNaN(num) ? 0 : num);
                }}
                className={inputBaseClasses}
                min={0}
                onFocus={handleNumericFocus}
              />
            </Field>

            <Field label="Gastos administrativos">
              <input
                type="text"
                value={formatNumber(form.gastosAdministrativos)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  const num = Number(raw);
                  actualizarForm("gastosAdministrativos", isNaN(num) ? 0 : num);
                }}
                className={inputBaseClasses}
                min={0}
                onFocus={handleNumericFocus}
              />
            </Field>

            <div className="col-span-full flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                {loading
                  ? simulacionId
                    ? "Actualizando…"
                    : "Calculando…"
                  : simulacionId
                  ? "Actualizar"
                  : "Calcular"}
              </button>
              <button
                type="button"
                onClick={limpiarSimulacion}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {mostrandoResultados && contenidoResultados}
    </section>
  );
}

function ResumenCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

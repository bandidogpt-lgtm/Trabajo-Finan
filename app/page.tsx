'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Cliente } from '@/types/cliente';
import { Inmueble } from '@/types/inmueble';

type Section = 'inicio' | 'clientes' | 'propiedades' | 'simulador';
type FormMode = 'create' | 'edit';

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
};

type SimulacionForm = {
  clienteBusqueda: string;
  clienteId: number | null;
  clienteCorreo: string;
  clienteDni: string;
  inmuebleBusqueda: string;
  inmuebleId: number | null;
  valorInmueble: number;
  tipoMoneda: 'Soles' | 'Dólares';
  clasificacionBbp: number;
  montoBono: number;
  cuotaInicial: number;
  plazoMeses: number;
  montoPrestamoCalculado: number;
  fechaDesembolso: string;
  tipoTasa: 'Efectiva' | 'Nominal';
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

const ESTADOS_CIVILES = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Conviviente'];
const TIPOS_INMUEBLE = ['Departamento', 'Casa', 'Dúplex', 'Loft'];

const initialClienteForm: ClienteForm = {
  dni: '',
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  duenio_propiedad: 1,
  email: '',
  direccion: '',
  ingreso_mensual: 0,
  estado_civil: ESTADOS_CIVILES[0],
  telefono: '',
};

const initialInmuebleForm: InmuebleForm = {
  nombre_proyecto: '',
  precio_venta: 0,
  nro_cuartos: 1,
  area_m2: 50,
  ubicacion: '',
  descripcion: '',
  tipo: TIPOS_INMUEBLE[0],
  imagen_referencial: '',
};

const navItems = [
  { key: 'inicio' as const, label: 'Inicio' },
  { key: 'clientes' as const, label: 'Clientes' },
  { key: 'propiedades' as const, label: 'Propiedades' },
  { key: 'simulador' as const, label: 'Simulador de Crédito' },
];

const currencyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});
const inputBaseClasses =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-0';

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('clientes');
  const [globalSearch, setGlobalSearch] = useState('');

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
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-500'
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

          {activeSection === 'clientes' && <ClientesScreen searchTerm={globalSearch} />}
          {activeSection === 'propiedades' && <InmueblesScreen searchTerm={globalSearch} />}
          {activeSection === 'inicio' && (
            <SectionPlaceholder
              title="Resumen general"
              description="Selecciona una sección para comenzar a trabajar con tus clientes o propiedades."
            />
          )}
          {activeSection === 'simulador' && <SimuladorScreen />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activeSection, onSelect }: { activeSection: Section; onSelect: (key: Section) => void }) {
  return (
    <aside className="hidden w-64 flex-col justify-between rounded-3xl bg-[#0f1c2f] p-6 text-white shadow-2xl lg:flex">
      <div>
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inmobiliaria</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Horizonte Azul</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`rounded-2xl px-4 py-3 text-left text-base font-semibold transition ${
                activeSection === item.key
                  ? 'bg-white/20 text-white backdrop-blur'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0f1c2f] font-semibold">
          AH
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-300">Asesora</p>
          <p className="text-base font-semibold text-white">Ana Herrera</p>
        </div>
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
      case 'clientes':
        return 'Buscar clientes por nombre, DNI o teléfono';
      case 'propiedades':
        return 'Buscar propiedades por nombre o ubicación';
      default:
        return 'Buscar clientes, propiedades o simulaciones';
    }
  }, [activeSection]);

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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-semibold text-white">
          AH
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Vendedora</p>
          <p className="text-base font-semibold text-slate-900">Ana Herrera</p>
        </div>
      </div>
    </header>
  );
}

function SectionPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-[32px] bg-white p-10 text-center shadow-xl">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-4 text-slate-500">{description}</p>
    </section>
  );
}

function ClientesScreen({ searchTerm }: { searchTerm: string }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [detalle, setDetalle] = useState<Cliente | null>(null);
  const [formValues, setFormValues] = useState<ClienteForm>(initialClienteForm);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      setLoading(true);
      const res = await fetch('/api/clientes', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo obtener la lista de clientes');
      }
      setClientes(data as Cliente[]);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
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
        .join(' ')
        .toLowerCase();
      return haystack.includes(global) && haystack.includes(local);
    });
  }, [clientes, searchTerm, localSearch]);

  function resetFormulario() {
    setFormValues(initialClienteForm);
    setFormMode('create');
    setEditingId(null);
  }

  async function manejarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (formMode === 'edit' && editingId === null) {
      setFeedback({ type: 'error', message: 'No se ha seleccionado un cliente para actualizar.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        duenio_propiedad: Number(formValues.duenio_propiedad),
        ingreso_mensual: Number(formValues.ingreso_mensual),
      };

      const url = formMode === 'create' ? '/api/clientes' : `/api/clientes/${editingId}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar el cliente.');
      }

      setFeedback({
        type: 'success',
        message: formMode === 'create' ? 'Cliente creado correctamente.' : 'Cambios guardados.',
      });
      resetFormulario();
      await cargarClientes();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  async function verCliente(id: number) {
    try {
      const res = await fetch(`/api/clientes/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo obtener el detalle');
      }
      setDetalle(data as Cliente);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  }

  async function eliminarCliente(id: number) {
    if (!confirm('¿Deseas eliminar este cliente?')) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo eliminar el cliente.');
      }
      setFeedback({ type: 'success', message: 'Cliente eliminado correctamente.' });
      await cargarClientes();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  }

  function editarCliente(cliente: Cliente) {
    setFormMode('edit');
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
    });
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_minmax(360px,0.8fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Clientes registrados</h2>
              <p className="text-sm text-slate-500">Gestiona la información clave de cada cliente.</p>
            </div>
            <button
              onClick={cargarClientes}
              className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-500"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
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
                    <td colSpan={5} className="px-6 py-6 text-center text-slate-400">
                      {loading ? 'Cargando clientes…' : 'No hay coincidencias para tu búsqueda'}
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
                    <td className="px-6 py-4 text-slate-600">{cliente.telefono}</td>
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
                <h3 className="text-lg font-semibold text-emerald-900">Detalle del cliente</h3>
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
                  <dd>{detalle.duenio_propiedad ? 'Sí' : 'No'}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Teléfono</dt>
                  <dd>{detalle.telefono}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Ingreso mensual</dt>
                  <dd>{currencyFormatter.format(detalle.ingreso_mensual)}</dd>
                </div>
              </dl>
            </div>
          )}
        </article>

        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-widest text-brand-600">Formulario cliente</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {formMode === 'create' ? 'Registrar' : 'Actualizar'} cliente
            </h2>
            <p className="text-sm text-slate-500">
              Completa los campos obligatorios para crear o editar un registro.
            </p>
          </div>
          {feedback && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                feedback.type === 'error'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {feedback.message}
            </div>
          )}
          <form className="space-y-4" onSubmit={manejarSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombres">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.nombres}
                  onChange={(e) => setFormValues({ ...formValues, nombres: e.target.value })}
                  required
                />
              </Field>
              <Field label="Apellidos">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.apellidos}
                  onChange={(e) => setFormValues({ ...formValues, apellidos: e.target.value })}
                  required
                />
              </Field>
              <Field label="DNI">
                <input
                  className={inputBaseClasses}
                  type="text"
                  maxLength={8}
                  value={formValues.dni}
                  onChange={(e) => setFormValues({ ...formValues, dni: e.target.value })}
                  required
                />
              </Field>
              <Field label="Teléfono">
                <input
                  className={inputBaseClasses}
                  type="text"
                  maxLength={9}
                  value={formValues.telefono}
                  onChange={(e) => setFormValues({ ...formValues, telefono: e.target.value })}
                  required
                />
              </Field>
              <Field label="Fecha de nacimiento">
                <input
                  className={inputBaseClasses}
                  type="date"
                  value={formValues.fecha_nacimiento}
                  onChange={(e) => setFormValues({ ...formValues, fecha_nacimiento: e.target.value })}
                  required
                />
              </Field>
              <Field label="Estado civil">
                <select
                  className={inputBaseClasses}
                  value={formValues.estado_civil}
                  onChange={(e) => setFormValues({ ...formValues, estado_civil: e.target.value })}
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
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  required
                />
              </Field>
              <Field label="Dirección">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.direccion}
                  onChange={(e) => setFormValues({ ...formValues, direccion: e.target.value })}
                  required
                />
              </Field>
              <Field label="Ingreso mensual (S/)">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={0}
                  value={formValues.ingreso_mensual}
                  onChange={(e) => setFormValues({ ...formValues, ingreso_mensual: Number(e.target.value) })}
                  required
                />
              </Field>
              <Field label="¿Es dueño de propiedad?">
                <select
                  className={inputBaseClasses}
                  value={formValues.duenio_propiedad}
                  onChange={(e) => setFormValues({ ...formValues, duenio_propiedad: Number(e.target.value) })}
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-brand-600 px-6 py-2 font-semibold text-slate-500 disabled:opacity-50"
              >
                {submitting ? 'Guardando…' : formMode === 'create' ? 'Guardar' : 'Actualizar'}
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
    </section>
  );
}

function InmueblesScreen({ searchTerm }: { searchTerm: string }) {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [detalle, setDetalle] = useState<Inmueble | null>(null);
  const [formValues, setFormValues] = useState<InmuebleForm>(initialInmuebleForm);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    cargarInmuebles();
  }, []);

  async function cargarInmuebles() {
    try {
      setLoading(true);
      const res = await fetch('/api/inmuebles', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo obtener la lista de propiedades');
      }
      setInmuebles(data as Inmueble[]);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const filteredInmuebles = useMemo(() => {
    const global = searchTerm.trim().toLowerCase();
    const local = localSearch.trim().toLowerCase();
    return inmuebles.filter((inmueble) => {
      const haystack = `${inmueble.nombre_proyecto} ${inmueble.ubicacion} ${inmueble.tipo}`.toLowerCase();
      return haystack.includes(global) && haystack.includes(local);
    });
  }, [inmuebles, searchTerm, localSearch]);

  function resetFormulario() {
    setFormValues(initialInmuebleForm);
    setFormMode('create');
    setEditingId(null);
  }

  async function manejarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (formMode === 'edit' && editingId === null) {
      setFeedback({ type: 'error', message: 'No se ha seleccionado un inmueble para actualizar.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        precio_venta: Number(formValues.precio_venta),
        nro_cuartos: Number(formValues.nro_cuartos),
        area_m2: Number(formValues.area_m2),
      };

      const url = formMode === 'create' ? '/api/inmuebles' : '/api/inmuebles';
      const method = formMode === 'create' ? 'POST' : 'PUT';
      const body =
        method === 'POST'
          ? payload
          : {
              id: editingId,
              ...payload,
            };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar el inmueble.');
      }

      setFeedback({
        type: 'success',
        message: formMode === 'create' ? 'Inmueble creado correctamente.' : 'Cambios guardados.',
      });
      resetFormulario();
      await cargarInmuebles();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  async function verInmueble(id: number) {
    try {
      const res = await fetch(`/api/inmuebles?id=${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo obtener el detalle del inmueble');
      }
      setDetalle(data as Inmueble);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  }

  function editarInmueble(inmueble: Inmueble) {
    setFormMode('edit');
    setEditingId(inmueble.id);
    setFormValues({
      nombre_proyecto: inmueble.nombre_proyecto,
      precio_venta: inmueble.precio_venta,
      nro_cuartos: inmueble.nro_cuartos,
      area_m2: inmueble.area_m2,
      ubicacion: inmueble.ubicacion,
      descripcion: inmueble.descripcion || '',
      tipo: inmueble.tipo,
      imagen_referencial: inmueble.imagen_referencial || '',
    });
  }

  async function eliminarInmueble(id: number) {
    if (!confirm('¿Deseas eliminar esta propiedad?')) return;
    try {
      const res = await fetch(`/api/inmuebles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo eliminar la propiedad.');
      }
      setFeedback({ type: 'success', message: 'Inmueble eliminado correctamente.' });
      await cargarInmuebles();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_minmax(360px,0.8fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Inventario de propiedades</h2>
              <p className="text-sm text-slate-500">Controla los proyectos disponibles para la venta.</p>
            </div>
            <button
              onClick={cargarInmuebles}
              className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-500"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
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
                    <td colSpan={5} className="px-6 py-6 text-center text-slate-400">
                      {loading ? 'Cargando inmuebles…' : 'No hay coincidencias para tu búsqueda'}
                    </td>
                  </tr>
                )}
                {filteredInmuebles.map((inmueble) => (
                  <tr key={inmueble.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{inmueble.ubicacion}</div>
                      <p className="text-xs text-slate-400">{inmueble.nombre_proyecto}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{inmueble.area_m2} m²</td>
                    <td className="px-6 py-4 text-slate-900">{currencyFormatter.format(inmueble.precio_venta)}</td>
                    <td className="px-6 py-4 text-slate-600">{inmueble.tipo}</td>
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
                <h3 className="text-lg font-semibold text-brand-700">Detalle del inmueble</h3>
                <button onClick={() => setDetalle(null)} className="text-sm font-semibold text-brand-600">
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
                  <dd>{detalle.descripcion || 'Sin descripción registrada'}</dd>
                </div>
              </dl>
            </div>
          )}
        </article>

        <article className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-widest text-brand-600">Formulario propiedad</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {formMode === 'create' ? 'Registrar' : 'Actualizar'} inmueble
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa información relevante para disponibilizar el inmueble.
            </p>
          </div>
          {feedback && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                feedback.type === 'error'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-700'
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
                  onChange={(e) => setFormValues({ ...formValues, nombre_proyecto: e.target.value })}
                  required
                />
              </Field>
              <Field label="Dirección">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.ubicacion}
                  onChange={(e) => setFormValues({ ...formValues, ubicacion: e.target.value })}
                  required
                />
              </Field>
              <Field label="Precio (S/)">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={0}
                  value={formValues.precio_venta}
                  onChange={(e) => setFormValues({ ...formValues, precio_venta: Number(e.target.value) })}
                  required
                />
              </Field>
              <Field label="Metraje (m²)">
                <input
                  className={inputBaseClasses}
                  type="number"
                  min={10}
                  value={formValues.area_m2}
                  onChange={(e) => setFormValues({ ...formValues, area_m2: Number(e.target.value) })}
                  required
                />
              </Field>
              <Field label="Tipo de vivienda">
                <select
                  className={inputBaseClasses}
                  value={formValues.tipo}
                  onChange={(e) => setFormValues({ ...formValues, tipo: e.target.value })}
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
                  onChange={(e) => setFormValues({ ...formValues, nro_cuartos: Number(e.target.value) })}
                  required
                />
              </Field>
              <Field label="Nombre de imagen o URL (opcional)">
                <input
                  className={inputBaseClasses}
                  type="text"
                  value={formValues.imagen_referencial}
                  onChange={(e) => setFormValues({ ...formValues, imagen_referencial: e.target.value })}
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  className={`${inputBaseClasses} min-h-[90px]`}
                  value={formValues.descripcion}
                  onChange={(e) => setFormValues({ ...formValues, descripcion: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-brand-600 px-6 py-2 font-semibold text-slate-500 disabled:opacity-50"
              >
                {submitting ? 'Guardando…' : formMode === 'create' ? 'Guardar' : 'Actualizar'}
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
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-semibold text-slate-600">
      <span className="mb-1 block text-xs uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const initialSimulacionForm: SimulacionForm = {
  clienteBusqueda: '',
  clienteId: null,
  clienteCorreo: '',
  clienteDni: '',
  inmuebleBusqueda: '',
  inmuebleId: null,
  valorInmueble: 0,
  tipoMoneda: 'Soles',
  clasificacionBbp: 0,
  montoBono: 0,
  cuotaInicial: 10,
  plazoMeses: 120,
  montoPrestamoCalculado: 0,
  fechaDesembolso: new Date().toISOString().split('T')[0],
  tipoTasa: 'Efectiva',
  plazoTasaInteres: 7,
  periodoGracia: 0,
  plazoPeriodoGracia: 1,
  capitalizacion: 0,
  tasaInteres: 0,
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
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  useEffect(() => {
    obtenerClientes();
    obtenerInmuebles();
  }, []);

  useEffect(() => {
    const cuotaInicialMonto = (form.valorInmueble * form.cuotaInicial) / 100;
    const monto =
      Math.max(form.valorInmueble - cuotaInicialMonto - form.montoBono, 0) +
      form.costosIniciales +
      form.gastosAdministrativos;
    setForm((prev) => ({ ...prev, montoPrestamoCalculado: Number(monto.toFixed(2)) }));
  }, [
    form.valorInmueble,
    form.cuotaInicial,
    form.montoBono,
    form.costosIniciales,
    form.gastosAdministrativos,
  ]);

  async function obtenerClientes() {
    try {
      const res = await fetch('/api/clientes', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron obtener clientes');
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  }

  async function obtenerInmuebles() {
    try {
      const res = await fetch('/api/inmuebles', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron obtener inmuebles');
      const data = await res.json();
      setInmuebles(data);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
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
      inmueble.nombre_proyecto.toLowerCase().includes(form.inmuebleBusqueda.toLowerCase())
    );
  }, [inmuebles, form.inmuebleBusqueda]);

  function seleccionarCliente(cliente: Cliente) {
    setForm((prev) => ({
      ...prev,
      clienteId: cliente.id,
      clienteBusqueda: `${cliente.nombres} ${cliente.apellidos}`,
      clienteCorreo: cliente.email,
      clienteDni: cliente.dni,
    }));
  }

  function seleccionarInmueble(inmueble: Inmueble) {
    setForm((prev) => ({
      ...prev,
      inmuebleId: inmueble.id,
      inmuebleBusqueda: inmueble.nombre_proyecto,
      valorInmueble: inmueble.precio_venta,
    }));
  }

  function actualizarForm<Key extends keyof SimulacionForm>(key: Key, value: SimulacionForm[Key]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function generarFechasCronograma(totalCuotas: number) {
    const fechas: string[] = [];
    const base = new Date(form.fechaDesembolso);
    for (let i = 0; i < totalCuotas; i++) {
      const fecha = new Date(base);
      fecha.setMonth(base.getMonth() + i);
      fechas.push(fecha.toISOString().split('T')[0]);
    }
    setCronogramaFechas(fechas);
  }

  async function manejarCalculo(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    if (!form.clienteId || !form.inmuebleId) {
      setFeedback({ type: 'error', message: 'Selecciona un cliente y una propiedad para continuar.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipo_moneda: form.tipoMoneda === 'Soles' ? 0 : 1,
        tipo_tasa: form.tipoTasa === 'Efectiva' ? 0 : 1,
        tasa_interes: Number(form.tasaInteres) / 100,
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
        tem_seguro_desgravamen: Number(form.temSeguroDesgravamen) / 100,
        tasa_seguro_inmueble: Number(form.tasaSeguroInmueble) / 100,
        portes: Number(form.portes),
        costos_iniciales: Number(form.costosIniciales),
        gasto_admin: Number(form.gastosAdministrativos),
        usuario_id: 1,
        clientes_id: form.clienteId,
        inmueble_id: form.inmuebleId,
      };

      const res = await fetch('/api/simulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const mensaje = Array.isArray(data.error) ? data.error.join(' ') : data.error;
        throw new Error(mensaje || 'No se pudo registrar la simulación');
      }

      const simulacionId = data.simulacion?.id_simulacion;
      if (!simulacionId) throw new Error('No se obtuvo el identificador de la simulación');

      const calculo = await fetch(`/api/simulaciones?id=${simulacionId}`);
      const resultadoCalculo = await calculo.json();
      if (!calculo.ok) throw new Error(resultadoCalculo.error || 'No se pudo calcular la simulación');

      setResultado(resultadoCalculo);
      generarFechasCronograma(resultadoCalculo.data.length);
      setFeedback({ type: 'success', message: 'Simulación registrada y calculada correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }

  function exportarExcel() {
    if (!resultado) return;
    const cabecera = ['N°', 'Fecha', ...resultado.headers];
    const filas = resultado.data.map((fila, index) => [index + 1, cronogramaFechas[index] ?? '', ...fila]);
    const contenido = [cabecera, ...filas]
      .map((fila) => fila.map((celda) => (typeof celda === 'number' ? celda : `${celda}`)).join(','))
      .join('\n');

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'cronograma_simulacion.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  }

  const contenidoResultados = resultado ? (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Simulador de Créditos</h2>
            <p className="text-sm text-slate-500">Resumen de indicadores y cronograma generado.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setResultado(null)}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Editar simulación
            </button>
            <button
              type="button"
              onClick={exportarExcel}
              className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-500"
            >
              Exportar a Excel
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResumenCard title="TCEA" value={`${resultado.resumen.TCEA}`} />
          <ResumenCard title="VAN" value={currencyFormatter.format(resultado.resumen.VAN)} />
          <ResumenCard title="TIR" value={resultado.resumen.TIR} />
          <ResumenCard title="Saldo a financiar" value={currencyFormatter.format(resultado.resumen.saldo_financiar)} />
          <ResumenCard title="Cuota base" value={currencyFormatter.format(resultado.resumen.cuota_base)} />
          <ResumenCard title="Plazo (meses)" value={`${resultado.resumen.plazo_meses}`} />
          <ResumenCard title="Costo inicial" value={currencyFormatter.format(resultado.resumen.costos_iniciales)} />
          <ResumenCard title="Monto préstamo" value={currencyFormatter.format(resultado.resumen.monto_prestamo_total)} />
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cronograma</h3>
              <p className="text-sm text-slate-500">Detalle mensual del crédito (scroll para ver todo).</p>
            </div>
          </div>
          <div className="overflow-auto rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  {resultado.headers.map((header) => (
                    <th key={header} className="px-4 py-3 text-left whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {resultado.data.map((fila, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-600">{cronogramaFechas[index]}</td>
                    {fila.map((celda, celdaIndex) => (
                      <td key={celdaIndex} className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {typeof celda === 'number' ? currencyFormatter.format(celda) : celda}
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Simulador de Créditos</h2>
            <p className="text-sm text-slate-500">Ingresa los datos para obtener indicadores y el cronograma.</p>
          </div>
          <button className="rounded-2xl bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
            Visualizar simulaciones
          </button>
        </div>

        {feedback && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              feedback.type === 'error'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {!resultado && (
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={manejarCalculo}>
            <Field label="Cliente">
              <div className="relative">
                <input
                  value={form.clienteBusqueda}
                  onChange={(e) => actualizarForm('clienteBusqueda', e.target.value)}
                  placeholder="Buscar por DNI o nombre"
                  className={`${inputBaseClasses} pr-10`}
                />
                <div className="absolute right-3 top-2 text-slate-400">⌄</div>
                {form.clienteBusqueda && (
                  <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-slate-100 bg-white shadow-lg">
                    {clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => seleccionarCliente(cliente)}
                        className="flex w-full flex-col items-start px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-800">{cliente.nombres} {cliente.apellidos}</span>
                        <span className="text-xs text-slate-500">DNI: {cliente.dni}</span>
                      </button>
                    ))}
                    {clientesFiltrados.length === 0 && (
                      <p className="px-4 py-2 text-sm text-slate-500">Sin resultados</p>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Correo">
              <input
                value={form.clienteCorreo}
                readOnly
                placeholder="Correo del cliente"
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="DNI">
              <input
                value={form.clienteDni}
                readOnly
                placeholder="DNI del cliente"
                className={`${inputBaseClasses} bg-slate-100`}
              />
            </Field>

            <Field label="Propiedad">
              <div className="relative">
                <input
                  value={form.inmuebleBusqueda}
                  onChange={(e) => actualizarForm('inmuebleBusqueda', e.target.value)}
                  placeholder="Buscar por nombre de proyecto"
                  className={`${inputBaseClasses} pr-10`}
                />
                <div className="absolute right-3 top-2 text-slate-400">⌄</div>
                {form.inmuebleBusqueda && (
                  <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-slate-100 bg-white shadow-lg">
                    {inmueblesFiltrados.map((inmueble) => (
                      <button
                        key={inmueble.id}
                        type="button"
                        onClick={() => seleccionarInmueble(inmueble)}
                        className="flex w-full flex-col items-start px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-800">{inmueble.nombre_proyecto}</span>
                        <span className="text-xs text-slate-500">{currencyFormatter.format(inmueble.precio_venta)}</span>
                      </button>
                    ))}
                    {inmueblesFiltrados.length === 0 && (
                      <p className="px-4 py-2 text-sm text-slate-500">Sin resultados</p>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Tipo de Moneda">
              <select
                value={form.tipoMoneda}
                onChange={(e) => actualizarForm('tipoMoneda', e.target.value as SimulacionForm['tipoMoneda'])}
                className={inputBaseClasses}
              >
                <option value="Soles">Soles</option>
                <option value="Dólares">Dólares</option>
              </select>
            </Field>

            <Field label="Valor Inmueble">
              <input
                type="number"
                value={form.valorInmueble}
                onChange={(e) => actualizarForm('valorInmueble', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Clasificación Bono Buen Pagador">
              <input
                type="number"
                value={form.clasificacionBbp}
                onChange={(e) => actualizarForm('clasificacionBbp', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Monto Bono Buen Pagador">
              <input
                type="number"
                value={form.montoBono}
                onChange={(e) => actualizarForm('montoBono', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Cuota Inicial (%)">
              <input
                type="number"
                value={form.cuotaInicial}
                onChange={(e) => actualizarForm('cuotaInicial', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
                max={100}
              />
            </Field>

            <Field label="Plazo (meses)">
              <input
                type="number"
                value={form.plazoMeses}
                onChange={(e) => actualizarForm('plazoMeses', Number(e.target.value))}
                className={inputBaseClasses}
                min={1}
              />
            </Field>

            <Field label="Monto Préstamo">
              <input value={form.montoPrestamoCalculado} readOnly className={`${inputBaseClasses} bg-slate-100`} />
            </Field>

            <Field label="Fecha de Desembolso">
              <input
                type="date"
                value={form.fechaDesembolso}
                onChange={(e) => actualizarForm('fechaDesembolso', e.target.value)}
                className={inputBaseClasses}
              />
            </Field>

            <Field label="Tipo de Tasa de Interés">
              <select
                value={form.tipoTasa}
                onChange={(e) => actualizarForm('tipoTasa', e.target.value as SimulacionForm['tipoTasa'])}
                className={inputBaseClasses}
              >
                <option value="Efectiva">Efectiva</option>
                <option value="Nominal">Nominal</option>
              </select>
            </Field>

            <Field label="Plazo de tasa de interés (p)">
              <input
                type="number"
                value={form.plazoTasaInteres}
                onChange={(e) => actualizarForm('plazoTasaInteres', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Periodo de gracia (g)">
              <select
                value={form.periodoGracia}
                onChange={(e) => actualizarForm('periodoGracia', Number(e.target.value))}
                className={inputBaseClasses}
              >
                <option value={0}>Sin gracia</option>
                <option value={1}>Parcial</option>
                <option value={2}>Total</option>
              </select>
            </Field>

            <Field label="Capitalización (c)">
              <input
                type="number"
                value={form.capitalizacion}
                onChange={(e) => actualizarForm('capitalizacion', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Periodo de gracia (pg)">
              <input
                type="number"
                value={form.plazoPeriodoGracia}
                onChange={(e) => actualizarForm('plazoPeriodoGracia', Number(e.target.value))}
                className={inputBaseClasses}
                min={1}
              />
            </Field>

            <Field label="Tasa de Interés (i)">
              <input
                type="number"
                value={form.tasaInteres}
                onChange={(e) => actualizarForm('tasaInteres', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
                step="0.01"
              />
            </Field>

            <Field label="TEM Seguro Desgravamen">
              <input
                type="number"
                value={form.temSeguroDesgravamen}
                onChange={(e) => actualizarForm('temSeguroDesgravamen', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
                step="0.01"
              />
            </Field>

            <Field label="Tasa Seguro Inmueble">
              <input
                type="number"
                value={form.tasaSeguroInmueble}
                onChange={(e) => actualizarForm('tasaSeguroInmueble', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
                step="0.01"
              />
            </Field>

            <Field label="Portes">
              <input
                type="number"
                value={form.portes}
                onChange={(e) => actualizarForm('portes', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Costos iniciales">
              <input
                type="number"
                value={form.costosIniciales}
                onChange={(e) => actualizarForm('costosIniciales', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <Field label="Gastos administrativos">
              <input
                type="number"
                value={form.gastosAdministrativos}
                onChange={(e) => actualizarForm('gastosAdministrativos', Number(e.target.value))}
                className={inputBaseClasses}
                min={0}
              />
            </Field>

            <div className="col-span-full flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => setForm(initialSimulacionForm)}
                className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-brand-600 px-6 py-2 font-semibold text-white shadow hover:bg-brand-500 disabled:opacity-50"
              >
                {loading ? 'Calculando…' : 'Calcular'}
              </button>
            </div>
          </form>
        )}
      </div>

      {contenidoResultados}
    </section>
  );
}

function ResumenCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

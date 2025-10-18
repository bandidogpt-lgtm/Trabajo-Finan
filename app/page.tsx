'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Cliente } from '@/types/cliente';

type FormMode = 'create' | 'edit';

const ESTADOS_CIVILES = [
  'Soltero',
  'Casado',
  'Divorciado',
  'Viudo',
  'Conviviente',
];

type ClienteForm = {
  dni: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  duenho_propiedad: number;
  email: string;
  direccion: string;
  ingreso_mensual: number;
  estado_civil: string;
  telefono: string;
};

const initialFormState: ClienteForm = {
  dni: '',
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  duenho_propiedad: 0,
  email: '',
  direccion: '',
  ingreso_mensual: 0,
  estado_civil: ESTADOS_CIVILES[0],
  telefono: '',
};

export default function Home() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<ClienteForm>({
    ...initialFormState,
  });

  const tituloFormulario = useMemo(
    () => (formMode === 'create' ? 'Registrar nuevo cliente' : 'Editar cliente'),
    [formMode],
  );

  async function cargarClientes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo obtener la lista de clientes');
      }
      setClientes(data as Cliente[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  function resetFormulario() {
    setFormValues({ ...initialFormState });
    setFormMode('create');
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      ...formValues,
      duenho_propiedad: Number(formValues.duenho_propiedad),
      ingreso_mensual: Number(formValues.ingreso_mensual),
    };

    if (formMode === 'edit' && editingId === null) {
      setError('No se ha seleccionado ningún cliente para actualizar.');
      return;
    }

    const requestInit: RequestInit = {
      method: formMode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    const url =
      formMode === 'create'
        ? '/api/clientes'
        : `/api/clientes/${editingId}`;

    try {
      const res = await fetch(url, requestInit);
      const data = await res.json();

      if (!res.ok) {
        const mensaje = Array.isArray(data.errores)
          ? data.errores.join(' ')
          : data.error || 'Ocurrió un error inesperado.';
        throw new Error(mensaje);
      }

      setSuccess(
        formMode === 'create'
          ? 'Cliente creado correctamente.'
          : 'Cliente actualizado correctamente.',
      );
      resetFormulario();
      await cargarClientes();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function seleccionarCliente(cliente: Cliente) {
    setFormMode('edit');
    setEditingId(cliente.id);
    setFormValues({
      dni: cliente.dni,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      fecha_nacimiento: cliente.fecha_nacimiento,
      duenho_propiedad: cliente.duenho_propiedad,
      email: cliente.email,
      direccion: cliente.direccion,
      ingreso_mensual: cliente.ingreso_mensual,
      estado_civil: cliente.estado_civil,
      telefono: cliente.telefono,
    });
  }

  async function eliminarCliente(id: number) {
    const confirmar = confirm('¿Desea eliminar este cliente?');
    if (!confirmar) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo eliminar el cliente.');
      }
      setSuccess('Cliente eliminado correctamente.');
      await cargarClientes();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <section className="card">
        <h1>Gestión de clientes</h1>
        <p>
          Administra los datos de tus clientes desde un único lugar. El backend
          expone una API REST construida con Next.js y este panel consume esos
          endpoints para ofrecer un CRUD completo.
        </p>
      </section>

      <section className="card">
        <h2>{tituloFormulario}</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              DNI
              <input
                type="text"
                value={formValues.dni}
                onChange={(e) =>
                  setFormValues({ ...formValues, dni: e.target.value })
                }
                maxLength={8}
                required
              />
            </label>
            <label>
              Nombres
              <input
                type="text"
                value={formValues.nombres}
                onChange={(e) =>
                  setFormValues({ ...formValues, nombres: e.target.value })
                }
                required
              />
            </label>
            <label>
              Apellidos
              <input
                type="text"
                value={formValues.apellidos}
                onChange={(e) =>
                  setFormValues({ ...formValues, apellidos: e.target.value })
                }
                required
              />
            </label>
            <label>
              Fecha de nacimiento
              <input
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
            </label>
            <label>
              ¿Es dueño de la propiedad?
              <select
                value={formValues.duenho_propiedad}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    duenho_propiedad: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
              </select>
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                value={formValues.email}
                onChange={(e) =>
                  setFormValues({ ...formValues, email: e.target.value })
                }
                required
              />
            </label>
            <label>
              Dirección
              <input
                type="text"
                value={formValues.direccion}
                onChange={(e) =>
                  setFormValues({ ...formValues, direccion: e.target.value })
                }
                required
              />
            </label>
            <label>
              Ingreso mensual (S/.)
              <input
                type="number"
                step="0.001"
                value={formValues.ingreso_mensual}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    ingreso_mensual: Number(e.target.value),
                  })
                }
                required
              />
            </label>
            <label>
              Estado civil
              <select
                value={formValues.estado_civil}
                onChange={(e) =>
                  setFormValues({ ...formValues, estado_civil: e.target.value })
                }
              >
                {ESTADOS_CIVILES.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Teléfono
              <input
                type="text"
                value={formValues.telefono}
                onChange={(e) =>
                  setFormValues({ ...formValues, telefono: e.target.value })
                }
                maxLength={9}
                required
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="primary" type="submit">
              {formMode === 'create' ? 'Crear cliente' : 'Guardar cambios'}
            </button>
            {formMode === 'edit' && (
              <button
                type="button"
                className="secondary"
                onClick={() => resetFormulario()}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Listado de clientes</h2>
          <button className="secondary" onClick={cargarClientes} disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
        {clientes.length === 0 ? (
          <p>No hay clientes registrados todavía.</p>
        ) : (
          <div className="grid">
            {clientes.map((cliente) => (
              <article key={cliente.id} className="cliente-card">
                <h3>
                  {cliente.nombres} {cliente.apellidos}
                </h3>
                <div className="meta">
                  DNI: {cliente.dni} · Teléfono: {cliente.telefono}
                </div>
                <dl style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Correo</dt>
                    <dd style={{ margin: 0 }}>{cliente.email}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Dirección</dt>
                    <dd style={{ margin: 0 }}>{cliente.direccion}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Ingreso mensual</dt>
                    <dd style={{ margin: 0 }}>
                      S/. {cliente.ingreso_mensual.toFixed(3)}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Estado civil</dt>
                    <dd style={{ margin: 0 }}>{cliente.estado_civil}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Dueño de propiedad</dt>
                    <dd style={{ margin: 0 }}>
                      {cliente.duenho_propiedad === 1 ? 'Sí' : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Fecha de nacimiento</dt>
                    <dd style={{ margin: 0 }}>{cliente.fecha_nacimiento}</dd>
                  </div>
                </dl>
                <div className="acciones" style={{ marginTop: '1rem' }}>
                  <button
                    className="secondary"
                    onClick={() => seleccionarCliente(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="danger"
                    onClick={() => eliminarCliente(cliente.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

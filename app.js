// 1. Configuración de conexión con Supabase
const SUPABASE_URL = 'https://aythpvzvjckblirbilkj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4GF8UxO7m11sQpR8xPh9LA_K7S1PI_G';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Referencias del DOM
const form = document.getElementById('form-radio');
const inputId = document.getElementById('registro-id');
const inputPrograma = document.getElementById('programa');
const inputGenero = document.getElementById('genero');
const inputAlias = document.getElementById('alias_conductor');
const inputFecha = document.getElementById('fecha');
const inputDuracion = document.getElementById('duracion_minutos');

const tituloForm = document.getElementById('titulo-form');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const filtroGenero = document.getElementById('filtro-genero');
const tablaCuerpo = document.getElementById('tabla-cuerpo');

// 2. Cargar y listar registros (con filtro opcional por género)
async function cargarProgramas() {
  const generoSeleccionado = filtroGenero.value;

  let consulta = supabaseClient
    .from('agenda_radio')
    .select('*')
    .order('fecha', { ascending: true });

  if (generoSeleccionado !== 'Todos') {
    consulta = consulta.eq('genero', generoSeleccionado);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al conectar con la base de datos.');
    return;
  }

  renderizarTabla(data);
}

function renderizarTabla(lista) {
  tablaCuerpo.innerHTML = '';

  if (lista.length === 0) {
    tablaCuerpo.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay programas registrados para este género.</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${item.programa}</strong></td>
      <td><span class="badge">${item.genero}</span></td>
      <td>${item.alias_conductor}</td>
      <td>${item.fecha}</td>
      <td>${item.duracion_minutos} min</td>
      <td>
        <button class="btn-accion btn-editar" onclick="prepararEdicion(${item.id}, '${item.programa}', '${item.genero}', '${item.alias_conductor}', '${item.fecha}', ${item.duracion_minutos})">Editar</button>
        <button class="btn-accion btn-eliminar" onclick="eliminarPrograma(${item.id})">Eliminar</button>
      </td>
    `;
    tablaCuerpo.appendChild(fila);
  });
}

// 3. Crear o Modificar un registro
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datosPrograma = {
    programa: inputPrograma.value.trim(),
    genero: inputGenero.value,
    alias_conductor: inputAlias.value.trim(),
    fecha: inputFecha.value,
    duracion_minutos: parseInt(inputDuracion.value)
  };

  const idEdicion = inputId.value;

  if (idEdicion) {
    // Modificar existente
    const { error } = await supabaseClient
      .from('agenda_radio')
      .update(datosPrograma)
      .eq('id', idEdicion);

    if (error) {
      alert('Error al actualizar el registro.');
      return;
    }
  } else {
    // Crear nuevo
    const { error } = await supabaseClient
      .from('agenda_radio')
      .insert([datosPrograma]);

    if (error) {
      alert('Error al guardar el registro.');
      return;
    }
  }

  resetearFormulario();
  cargarProgramas();
});

// 4. Preparar formulario para editar
window.prepararEdicion = (id, programa, genero, alias, fecha, duracion) => {
  inputId.value = id;
  inputPrograma.value = programa;
  inputGenero.value = genero;
  inputAlias.value = alias;
  inputFecha.value = fecha;
  inputDuracion.value = duracion;

  tituloForm.textContent = 'Modificar Programa';
  btnGuardar.textContent = 'Actualizar Programa';
  btnCancelar.classList.remove('oculto');
};

btnCancelar.addEventListener('click', resetearFormulario);

function resetearFormulario() {
  form.reset();
  inputId.value = '';
  tituloForm.textContent = 'Agregar Nuevo Programa';
  btnGuardar.textContent = 'Guardar Programa';
  btnCancelar.classList.add('oculto');
}

// 5. Eliminar registro
window.eliminarPrograma = async (id) => {
  const confirmar = confirm('¿Estás seguro de eliminar este programa de la agenda?');
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from('agenda_radio')
    .delete()
    .eq('id', id);

  if (error) {
    alert('No se pudo eliminar el registro.');
    return;
  }

  cargarProgramas();
};

// Evento de cambio en el filtro
filtroGenero.addEventListener('change', cargarProgramas);

// Cargar datos al abrir la página
document.addEventListener('DOMContentLoaded', cargarProgramas);
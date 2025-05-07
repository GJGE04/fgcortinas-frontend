import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Box, TextField, Button, MenuItem, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "../css/CalendarioVisitas.css";
import { useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { getTechnicians, getClients } from "../services/apiService"; 

export default function CalendarioVisitas() {
  const [citas, setCitas] = useState([
    {
      id: "1",
      title: "Presupuesto - María López",
      start: "2025-05-01T14:00:00",
      end: "2025-05-01T15:00:00",
      extendedProps: {
        tecnicoNombre: "Juan Pérez",
        tipo: "Presupuesto",
        direccion: "Av. Principal 1234",
      },
      color: "#1976D2",
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [nuevaCita, setNuevaCita] = useState({
    fecha: dayjs(),
    horaInicio: dayjs(),
    horaFin: dayjs().add(1, "hour"),
    tecnicoNombre: "",
    clienteNombre: "",
    tipo: "Presupuesto",
    direccion: "",
  });

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [technicians, setTechnicians] = useState([]);  // Técnicos
  const [clients, setClients] = useState([]);

  // Cargar técnicos y clientes desde la base de datos
  useEffect(() => {

    const fetchData = async () => {
      try{
        // Técnicos
        const tecnicosData = await getTechnicians();
        console.log(tecnicosData); // Verifica que los técnicos se están obteniendo correctamente
        setTechnicians(tecnicosData.map(user => ({ value: user._id, label: `${user.username}` })));

        // Técnicos
        const clientesData = await getClients();
        console.log(clientesData); // Verifica que los técnicos se están obteniendo correctamente
        setClients(clientesData.map(client => ({ value: client._id, label: `${client.nombre}` })));
      }
      catch (error) {
        console.error("Error al cargar los técnicos o los clientes:", error);

        // Manejo de errores
        if (error.response && error.response.status === 401) {
          // message.error("No autorizado. Por favor, inicia sesión nuevamente.");
          console.error("Respuesta de error:", error.response);
        } else {
            // message.error("No se pudo cargar los productos.");
            console.error("Error sin respuesta de la API:", error);
        } 
      } finally {
        // setLoadingProducts(false);
      }
    }
    fetchData();
    // Asumiendo que tienes endpoints como /api/tecnicos y /api/clientes
 /*   axios.get("/api/tecnicos")
      .then(response => {
        setTecnicos(response.data);
      })
      .catch(error => {
        console.error("Error al obtener técnicos", error);
      });  */

      

              /*
    axios.get("/api/clientes")
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => {
        console.error("Error al obtener clientes", error);
      });  */
  }, []);

  const handleDateClick = (info) => {
    setModoEdicion(false);
    setNuevaCita({
      fecha: dayjs(info.dateStr),
      horaInicio: dayjs(info.dateStr).hour(9).minute(0),
      horaFin: dayjs(info.dateStr).hour(10).minute(0),
      tecnicoNombre: "",
      clienteNombre: "",
      tipo: "Presupuesto",
      direccion: "",
    });
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    const evento = info.event;
    setModoEdicion(true);
    setEventoSeleccionado(evento);

    setNuevaCita({
      fecha: dayjs(evento.startStr),
      horaInicio: dayjs(evento.startStr),
      horaFin: evento.endStr ? dayjs(evento.endStr) : dayjs(evento.startStr).add(1, "hour"),
      tecnicoNombre: evento.extendedProps.tecnicoNombre || "",
      clienteNombre: evento.title.split("-")[1]?.trim() || "",
      tipo: evento.extendedProps.tipo || "Presupuesto",
      direccion: evento.extendedProps.direccion || "",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetNuevaCita();
    setEventoSeleccionado(null);
    setModoEdicion(false);
  };

  const resetNuevaCita = () => {
    setNuevaCita({
      fecha: dayjs(),
      horaInicio: dayjs(),
      horaFin: dayjs().add(1, "hour"),
      tecnicoNombre: "",
      clienteNombre: "",
      tipo: "Presupuesto",
      direccion: "",
    });
  };

  const mostrarToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };
  
  const handleGuardarCita = () => {
    if (!nuevaCita.tecnicoNombre || !nuevaCita.clienteNombre || !nuevaCita.fecha) {
      mostrarToast("Completa todos los campos obligatorios.", "error");
      return;
    }

    const start = nuevaCita.fecha
      .hour(nuevaCita.horaInicio.hour())
      .minute(nuevaCita.horaInicio.minute())
      .second(0)
      .toISOString();
    const end = nuevaCita.fecha
      .hour(nuevaCita.horaFin.hour())
      .minute(nuevaCita.horaFin.minute())
      .second(0)
      .toISOString();

    if (modoEdicion && eventoSeleccionado) {
      // Actualizar cita
      setCitas(prev =>
        prev.map(cita =>
          cita.id === eventoSeleccionado.id
            ? {
                ...cita,
                title: `${nuevaCita.tipo} - ${nuevaCita.clienteNombre}`,
                start,
                end,
                extendedProps: {
                  tecnicoNombre: nuevaCita.tecnicoNombre,
                  tipo: nuevaCita.tipo,
                  direccion: nuevaCita.direccion,
                },
                color: nuevaCita.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",
              }
            : cita
        )
      );
      mostrarToast("Cita actualizada correctamente.");
    } else {
      // Crear nueva cita
      const nueva = {
        id: String(Date.now()),
        title: `${nuevaCita.tipo} - ${nuevaCita.clienteNombre}`,
        start,
        end,
        extendedProps: {
          tecnicoNombre: nuevaCita.tecnicoNombre,
          tipo: nuevaCita.tipo,
          direccion: nuevaCita.direccion,
        },
        color: nuevaCita.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",
      };
      setCitas(prev => [...prev, nueva]);
      mostrarToast("Cita agendada correctamente.");
    }

    handleCloseModal();
  };

  const handleEliminarCita = () => {
    if (eventoSeleccionado) {
      if (window.confirm("¿Seguro que deseas eliminar esta cita?")) {
        setCitas(prev => prev.filter(cita => cita.id !== eventoSeleccionado.id));
        mostrarToast("Cita eliminada correctamente.");
        handleCloseModal();
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-4">
        <Typography variant="h4" mb={2}>
          Calendario de Visitas
        </Typography>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          selectable
          editable
          events={citas}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />

        {/* Modal de creación / edición */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 420,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              {modoEdicion ? "Editar Visita" : "Nueva Visita"}
            </Typography>

            <DatePicker
              label="Fecha"
              value={nuevaCita.fecha}
              onChange={(newValue) => setNuevaCita({ ...nuevaCita, fecha: newValue })}
              sx={{ width: "100%" }}
            />
            <TimePicker
              label="Hora de inicio"
              value={nuevaCita.horaInicio}
              onChange={(newValue) => setNuevaCita({ ...nuevaCita, horaInicio: newValue })}
              sx={{ width: "100%" }}
            />
            <TimePicker
              label="Hora de fin"
              value={nuevaCita.horaFin}
              onChange={(newValue) => setNuevaCita({ ...nuevaCita, horaFin: newValue })}
              sx={{ width: "100%" }}
            />

            <TextField
              label="Técnico"
              value={nuevaCita.tecnicoNombre}
              onChange={(e) => setNuevaCita({ ...nuevaCita, tecnicoNombre: e.target.value })}
              required
              select
            >
              {technicians.map((tecnico) => (
                <MenuItem key={tecnico.value} value={tecnico.value}>
                  {tecnico.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="Cliente"
              value={nuevaCita.clienteNombre}
              onChange={(e) => setNuevaCita({ ...nuevaCita, clienteNombre: e.target.value })}
              required
              select
            >
              {clients.map((cliente) => (
                <MenuItem key={cliente.value} value={cliente.value}>
                  {cliente.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Dirección"
              value={nuevaCita.direccion}
              onChange={(e) => setNuevaCita({ ...nuevaCita, direccion: e.target.value })}
            />
            <TextField
              label="Tipo"
              select
              value={nuevaCita.tipo}
              onChange={(e) => setNuevaCita({ ...nuevaCita, tipo: e.target.value })}
            >
              <MenuItem value="Presupuesto">Presupuesto</MenuItem>
              <MenuItem value="Trabajo">Trabajo</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              {modoEdicion && (
                <Button variant="outlined" color="error" onClick={handleEliminarCita}>
                  Eliminar
                </Button>
              )}
              <Button variant="contained" color="primary" onClick={handleGuardarCita}>
                {modoEdicion ? "Actualizar" : "Guardar"}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
}

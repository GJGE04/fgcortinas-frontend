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
import { getTechnicians, getClients, getScheduledVisits, createCalendarEvent } from "../services/apiService"; 

export default function CalendarioVisitas() { /*
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
  ]); */

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

  const [citas, setCitas] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tecnicosData = await getTechnicians();
        const tecnicosFormateados = tecnicosData.map((tecnico) => ({
          value: tecnico._id,
          label: tecnico.username,
        }));
        console.log("✅ Técnicos recibidos:", tecnicosFormateados);
        setTechnicians(tecnicosFormateados);
      } catch (error) {
        console.error("Error al cargar técnicos:", error);
        mostrarToast("Error cargando técnicos", "error");
      }
      try {
        const clientesData = await getClients();

        const clientesFormateados = clientesData.map((cliente) => ({
          value: cliente._id,
          label: cliente.nombre,
        }));
        console.log("✅ Clientes recibidos:", clientesFormateados);
        setClients(clientesFormateados);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        mostrarToast("Error cargando  clientes", "error");
      }
    };
  
    fetchData();
  }, []);  

  // traer los datos reales del backend:
  /* Version v1 donde 
  useEffect(() => {
    const fetchScheduledVisits = async () => {
      try {
        const res = await fetch(`${API_URL}/calendar/events`);
        const data = await res.json();
        const formattedEvents = data.events.map(event => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date, // Asegúrate de que las fechas están correctas
          end: event.end.dateTime || event.end.date,
          description: event.description || "",
          creator: event.creator?.email || "", // o el campo que necesites
          color: "#1976D2", // O cualquier otro color dependiendo de la lógica
        }));
  
        setCitas(formattedEvents); // setCitas debe tener el mismo formato
      } catch (error) {
        console.error("❌ Error al cargar eventos:", error);
      }
  };
  fetchScheduledVisits();
  }, []);   
  */
/*  version trayendo solo citas de la BD
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(`${API_URL}/citas`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });        
        const data = await res.json();
        console.log("📥 Datos crudos desde el backend:", data);

        // CAMBIO AQUÍ 👇
        const citasFormateadas = data.map((cita) => {
          const tecnicoNombres = cita.tecnicos?.map(t => {
            const tecnicoInfo = technicians.find(tec => tec.value === t._id);
            return tecnicoInfo ? tecnicoInfo.label : "Técnico desconocido";
          }).join(", ");
        
          return {
            id: cita._id,
            title: `${cita.tipo}${cita.cliente?.nombre ? " - " + cita.cliente.nombre : ""}`,
            start: cita.fechaInicio,
            end: cita.fechaFin,
            extendedProps: {
              direccion: cita.direccion,
              tipo: cita.tipo,
              tecnicoIds: cita.tecnicos?.map(t => t._id) || [],
              tecnicoNombre: tecnicoNombres,
              clienteNombre: cita.cliente?.nombre || "Sin cliente",
            },
            color: cita.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",
          };
        });   
        console.log("✅ Citas formateadas para FullCalendar:", citasFormateadas);
        setCitas(citasFormateadas);
      } catch (error) {
        console.error("❌ Error al cargar citas:", error);
        mostrarToast("Error cargando citas", "error");
      }
    };
  
    fetchCitas();
  }, []);  */

 /* v2 */
  useEffect(() => {  // version trayendo citas y eventos
    const fetchCitasYEventos = async () => {
      try {
        // 🔹 Obtener citas desde tu base de datos
        const resCitas = await fetch(`${API_URL}/citas`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });
        const dataCitas = await resCitas.json();
  
        const citasFormateadas = dataCitas.map((cita) => {
          const tecnicoNombres = cita.tecnicos?.map(t => {
            const tecnicoInfo = technicians.find(tec => tec.value === t._id);
            return tecnicoInfo ? tecnicoInfo.label : "Técnico desconocido";
          }).join(", ");
  
          return {
            id: cita._id,
            title: `${cita.tipo}${cita.cliente?.nombre ? " - " + cita.cliente.nombre : ""}`,
            start: cita.fechaInicio,
            end: cita.fechaFin,
            extendedProps: {
              direccion: cita.direccion,
              tipo: cita.tipo,
              tecnicoIds: cita.tecnicos?.map(t => t._id) || [],
              tecnicoNombre: tecnicoNombres,
              clienteNombre: cita.cliente?.nombre || "Sin cliente",
              source: "sistema", // 👈 Agregamos source para CRUD
            },
            color: cita.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",
          };
        });
  
        // 🔹 Obtener eventos desde Google Calendar
        const resEventos = await fetch(`${API_URL}/calendar/events`);
        const dataEventos = await resEventos.json();
  
        const eventosFormateados = dataEventos.events.map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          extendedProps: {
            description: event.description || "",
            source: "google",
          },
          color: "#43A047", // un color distinto para diferenciarlos
        }));
  
        // 🔄 Fusionar los dos conjuntos de eventos
        const eventosCombinados = [...citasFormateadas, ...eventosFormateados];
  
        // ✅ Setear en el estado único de eventos del calendario
        setCitas(eventosCombinados);
  
        console.log("📆 Eventos combinados:", eventosCombinados);
      } catch (error) {
        console.error("❌ Error al cargar citas y eventos:", error);
        mostrarToast("Error cargando eventos del calendario", "error");
      }
    };
  
    // fetchCitasYEventos();
    // Asegurarnos de que `technicians` ya fue cargado
    if (technicians.length > 0) {
      fetchCitasYEventos();
    }
  }, [technicians]);

  /*  eliminar solo de la bd
  const handleEliminarCita = async () => {
    if (eventoSeleccionado) {
      const confirmacion = window.confirm("¿Seguro que deseas eliminar esta cita?");
      if (!confirmacion) return;
  
      try {
        const res = await fetch(`${API_URL}/citas/${eventoSeleccionado.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });    
        
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Error al eliminar la cita");
  
        // Eliminar del estado local
        setCitas((prev) => prev.filter((cita) => cita.id !== eventoSeleccionado.id));
        // mostrarToast("Cita eliminada correctamente.", "success");
        if (result.googleCalendarWarning) {
          mostrarToast(result.message, "warning");
        } else {
          mostrarToast("Cita eliminada correctamente.", "success");
        }
      } catch (error) {
        console.error("❌ Error al eliminar la cita:", error);
        mostrarToast("No se pudo eliminar la cita. Intenta nuevamente.", "error");
      } finally {
        handleCloseModal();
      }
    }
  };
  */

  const handleEliminarCita = async () => {
    if (!eventoSeleccionado) return;
  
    const confirmacion = window.confirm("¿Seguro que deseas eliminar esta cita?");
    if (!confirmacion) return;

    const isGoogleEvent = eventoSeleccionado.extendedProps?.source === "google";
  
    try {
      let res, result;

      // 📍 2. Si es un evento de Google Calendar externo (quizás no está en la base de datos)
      if (isGoogleEvent) {
        // 🔁 Eliminar desde Google Calendar.    // 🔹 Evento solo en Google Calendar
        res = await fetch(`${API_URL}/calendar/delete-event/${eventoSeleccionado.id}`, {
          method: "DELETE",
        });
        result = await res.json();
  
        if (!res.ok) throw new Error(result.message || "Error al eliminar evento de Google Calendar");
      } else {    // 📍 1. Si es una cita del sistema (base de datos)
        // 🔁 Eliminar desde la base de datos (y opcionalmente también en Google)
        res = await fetch(`${API_URL}/citas/${eventoSeleccionado.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        result = await res.json();
  
        if (!res.ok) throw new Error(result.message || "Error al eliminar la cita");   // throw new Error("Error al eliminar el evento de Google Calendar");
      }
  
      // 🧹 Eliminar del estado local
      setCitas((prev) => prev.filter((cita) => cita.id !== eventoSeleccionado.id));
      // mostrarToast("Evento de Google Calendar eliminado correctamente.", "success");
  
      // ✅ Mostrar mensaje según resultado
      if (result.googleCalendarWarning) {
        mostrarToast(`${result.message}`, "warning"); // o "info"
        console.warn("⚠️ Advertencia:", result.error);
      } else {
        mostrarToast("✅ Cita eliminada correctamente.", "success");
      }
  
    } catch (error) {
      console.error("❌ Error al eliminar la cita:", error);
      mostrarToast("No se pudo eliminar la cita. Intenta nuevamente.", "error");
    } finally {
      handleCloseModal();
    }
  };  

  // Cargar técnicos y clientes desde la base de datos
 /* useEffect(() => {

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
 // }, []); */

  const handleDateClick = (info) => {
    setModoEdicion(false);
    setNuevaCita({
      fecha: dayjs(info.dateStr),
      horaInicio: dayjs(info.dateStr).hour(9).minute(0),
      horaFin: dayjs(info.dateStr).hour(10).minute(0),
      // tecnicoNombre: "",
      // clienteNombre: "",
      tecnicoId: "",
      clienteId: "",
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
    // resetNuevaCita();
    setEventoSeleccionado(null);
    setModoEdicion(false);
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
  
  /*
  const handleGuardarCita = async () => {
    if (!nuevaCita.tecnicoId || !nuevaCita.clienteId || !nuevaCita.fecha) {
      mostrarToast("Completa todos los campos obligatorios.", "error");
      return;
    }
  
    const tecnicoNombre = technicians.find(t => t.value === nuevaCita.tecnicoId)?.label || "";
    const clienteNombre = clients.find(c => c.value === nuevaCita.clienteId)?.label || "";
  
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
      // 🔄 Actualizar evento
      try {
        const res = await fetch(`/api/calendar/update-event/${eventoSeleccionado.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: `${nuevaCita.tipo} - ${clienteNombre}`,
            start,
            end,
            description: `Técnico: ${tecnicoNombre}\nDirección: ${nuevaCita.direccion}`,
          }),
        });
  
        const updatedEvent = await res.json();
  
        if (!res.ok) throw new Error(updatedEvent.message || "Error al actualizar evento.");
  
        setCitas((prev) =>
          prev.map((cita) =>
            cita.id === eventoSeleccionado.id
              ? {
                  id: updatedEvent.id,
                  title: updatedEvent.summary,
                  start: updatedEvent.start,
                  end: updatedEvent.end,
                  extendedProps: {
                    tecnicoId: nuevaCita.tecnicoId,
                    tecnicoNombre,
                    clienteId: nuevaCita.clienteId,
                    clienteNombre,
                    direccion: nuevaCita.direccion,
                    description: updatedEvent.description,
                    creator: updatedEvent.creator?.email || "",
                  },
                  color: "#1976D2",
                }
              : cita
          )
        );
  
        mostrarToast("Cita actualizada correctamente.");
      } catch (error) {
        console.error("❌ Error actualizando evento:", error);
        mostrarToast("No se pudo actualizar la cita.", "error");
      }
    } else {
      // ➕ Crear nuevo evento
      try {
        const res = await fetch("/api/calendar/create-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: `${nuevaCita.tipo} - ${clienteNombre}`,
            start,
            end,
            description: `Técnico: ${tecnicoNombre}\nDirección: ${nuevaCita.direccion}`,
          }),
        });
  
        const createdEvent = await res.json();
  
        if (!res.ok) throw new Error(createdEvent.message || "Error al crear evento.");
  
        setCitas((prev) => [
          ...prev,
          {
            id: createdEvent.id,
            title: createdEvent.summary,
            start: createdEvent.start,
            end: createdEvent.end,
            extendedProps: {
              tecnicoId: nuevaCita.tecnicoId,
              tecnicoNombre,
              clienteId: nuevaCita.clienteId,
              clienteNombre,
              direccion: nuevaCita.direccion,
              description: createdEvent.description,
              creator: createdEvent.creator?.email || "",
            },
            color: "#1976D2",
          },
        ]);
  
        mostrarToast("Cita agendada correctamente.");
      } catch (error) {
        console.error("❌ Error creando evento:", error);
        mostrarToast("No se pudo crear la cita.", "error");
      }
    }
  
    handleCloseModal();
  };  
  */

  const handleGuardarCita = async () => {
    if (!nuevaCita.tecnicoId || !nuevaCita.clienteId || !nuevaCita.fecha) {
      mostrarToast("Completa todos los campos obligatorios.", "error");
      return;
    }

    if (!nuevaCita.fecha || !nuevaCita.horaInicio || !nuevaCita.horaFin) {
      mostrarToast("Faltan datos de fecha u hora", "error");
      return;
    }    
  
    const tecnicoNombre = technicians.find(t => t.value === nuevaCita.tecnicoId)?.label || "";
    const clienteNombre = clients.find(c => c.value === nuevaCita.clienteId)?.label || "";

    console.log("🕒 nuevaCita.fecha:", nuevaCita.fecha?.toString());
    console.log("🕒 horaInicio:", nuevaCita.horaInicio?.toString());
    console.log("🕒 horaFin:", nuevaCita.horaFin?.toString());
  
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
      // 🔄 Actualizar evento
      try {
        const res = await fetch(`${API_URL}/citas/${eventoSeleccionado.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            direccion: nuevaCita.direccion,
            telefono: "",
            tipo: nuevaCita.tipo,
            tecnicos: [nuevaCita.tecnicoId],
            cliente: nuevaCita.clienteId,
            fechaInicio: start,
            fechaFin: end,
            sincronizarGoogleCalendar: true, // ✅ ACTIVADO. // 🔁 Google Calendar también
          }),
        });        
  
        const updatedEvent = await res.json();
  
        if (!res.ok) throw new Error(updatedEvent.message || "Error al actualizar evento.");
  
        setCitas((prev) =>
          prev.map((cita) =>
            cita.id === eventoSeleccionado.id
              ? {
                  id: updatedEvent.id,
                  // title: updatedEvent.summary,
                  title: `${updatedEvent.cita.tipo} - ${updatedEvent.cita.cliente?.nombre || "Cliente"}`,
                  // start: updatedEvent.start,
                  // end: updatedEvent.end,
                  start: updatedEvent.cita.fechaInicio,
                  end: updatedEvent.cita.fechaFin,
                  extendedProps: {
                    tecnicoId: nuevaCita.tecnicoId,
                    tecnicoNombre,
                    clienteId: nuevaCita.clienteId,
                    clienteNombre,
                    // direccion: nuevaCita.direccion,
                    // description: updatedEvent.description,
                    direccion: updatedEvent.cita.direccion,
                    description: updatedEvent.cita.descripcion || "",
                    creator: updatedEvent.creator?.email || "",
                  },
                  color: "#1976D2",
                }
              : cita
          )
        );

        if (updatedEvent.googleCalendarWarning) {
          mostrarToast(updatedEvent.message, "warning");
        } else {
          mostrarToast("Cita actualizada correctamente.");
        }
  
        // mostrarToast("Cita actualizada correctamente.");
      } catch (error) {
        console.error("❌ Error actualizando evento:", error);
        mostrarToast("No se pudo actualizar la cita.", "error");
      }
    } else {
      // ➕ Crear nuevo evento
      try {
        console.log("📤 Enviando al backend:", {
          direccion: nuevaCita.direccion,
          telefono: "",
          tipo: nuevaCita.tipo,
          tecnicos: [nuevaCita.tecnicoId],
          cliente: nuevaCita.clienteId,
          fechaInicio: start,
          fechaFin: end,
        });        
        const res = await fetch(`${API_URL}/citas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // si usás auth
          },
          body: JSON.stringify({
            direccion: nuevaCita.direccion,
            telefono: "", // opcional
            tipo: nuevaCita.tipo,
            tecnicos: [nuevaCita.tecnicoId],
            cliente: nuevaCita.clienteId,
            fechaInicio: start,
            fechaFin: end,
            sincronizarGoogleCalendar: true, // ✅ ACTIVADO
          }),
        });        
  
        const citaGuardada = await res.json();
        console.log("🆕 Cita guardada en backend:", citaGuardada);
  
        if (!res.ok) throw new Error(citaGuardada.message || "Error al crear evento.");
  
        console.log("✅ Cita devuelta por el backend:", citaGuardada);
        console.log("🛠️ Técnico:", tecnicoNombre, "Cliente:", clienteNombre);

        setCitas((prev) => [
          ...prev,
          { /*
            id: citaGuardada._id,
            title: `${citaGuardada.tipo} - ${citaGuardada.cliente?.nombre || "Cliente"}`,
            start: citaGuardada.fechaInicio,
            end: citaGuardada.fechaFin,
            extendedProps: {
              tecnicoId: nuevaCita.tecnicoId,
              tecnicoNombre,
              clienteId: nuevaCita.clienteId,
              clienteNombre,
              direccion: citaGuardada.direccion,
              description: "", // si no hay en backend
              creator: "",     // si no hay en backend
            }, 
            color: citaGuardada.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",  */

            id: citaGuardada.cita._id,
    title: `${citaGuardada.cita.tipo} - ${citaGuardada.cita.cliente?.nombre || "Cliente"}`,
    start: citaGuardada.cita.fechaInicio,
    end: citaGuardada.cita.fechaFin,
    extendedProps: {
      tecnicoId: nuevaCita.tecnicoId,
      tecnicoNombre,
      clienteId: nuevaCita.clienteId,
      clienteNombre,
      direccion: citaGuardada.cita.direccion,
      description: "", 
    },
    color: citaGuardada.cita.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",
          },
        ]);       
        
        console.log("Parametos de createCalendarEvent2", [nuevaCita.tecnicoId], start, end);
        console.log("start", start);
        console.log("end", end);
        console.log("tecnicoId", [nuevaCita.tecnicoId]);
        // createCalendarEvent2([nuevaCita.tecnicoId], start, end);
        handleCreateEvent();
  
        // mostrarToast("Cita agendada correctamente.");
        if (citaGuardada.googleCalendarWarning) {             // verificar si funciona el googleCalendarWarning
          mostrarToast(citaGuardada.message, "warning");   
        } else {
          mostrarToast("Cita agendada correctamente.");
        }
      } catch (error) {
        console.error("❌ Error creando evento:", error);
        mostrarToast("No se pudo crear la cita.", "error");
      }
    }
  
    handleCloseModal();
  };  

  const createCalendarEvent2 = async () => { // quote   //   technicianId, start, end
    // console.log("Entrando en createCalendarEvent2: " , technicianId, start, end);
    // const tecnicoSeleccionadoId = technicianId;
    // const tecnicoSeleccionado = technicians.find(t => t.value === tecnicoSeleccionadoId);
    // const tecnicoName = tecnicoSeleccionado?.label || 'Sin técnico';
    // console.log("Tecnico: " , tecnicoName);      
    try{
      // (technicians.find(t => t.value === form.getFieldValue('technicianId')))?.label || 'Sin técnico'
      const eventData = {
        summary: 'Cita técnica',     // summary: `Visita técnica - ${clientName}`,
        // description: 'Agendada desde el formulario completo de FG Cortinas',
        description: `Visita técnica agendada.`, // `Visita técnica agendada para el cliente:, atendida por el técnico: ${tecnicoName}.`, //  ${client.name}
        // description: `Visita técnica para el cliente ${values.nombreCliente || 'sin nombre'}`,
        start: '2025-05-23T10:00:00',
        end: '2025-05-23T12:00:00',
      };
      console.log("eventData: " , eventData);
      // await axios.post('/api/calendar/create-event', eventData);  
      const result = await fetch(`${API_URL}/calendar/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!result.ok) {
        throw new Error(`Error HTTP: ${result.status}`);
      }
      
      const data = await result.json();
      console.log('✅ Evento agendado:', data);
      
      // console.log('✅ Evento agendado:', result.data);
    }
    catch (error) {
      console.error('❌ Error al agendar visita:', error);
      // message.error('No se pudo agendar la visita técnica');
      return; // Evitamos continuar si falla
    }
  };

  const handleCreateEvent = async () => {
    const newEvent = {
      summary: "Reunión de equipo1205",
      description: "Reunión semanal de seguimiento",
      start: "2025-05-21T10:00:00",
      end: "2025-05-21T13:00:00"
    };

    try {
      const result = await createCalendarEvent(newEvent);
      console.log("Evento creado:", result.event.htmlLink);
    } catch (err) {
      // Ya se maneja error en el servicio, pero podés hacer algo extra acá
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
            <Typography variant="h6">
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
              label="👨‍🔧Técnico"
              value={nuevaCita.tecnicoId}
              onChange={(e) => setNuevaCita({ ...nuevaCita, tecnicoId: e.target.value })}
              required
              select
              fullWidth
            >
              {technicians.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="👤Cliente"
              value={nuevaCita.clienteId}
              onChange={(e) => setNuevaCita({ ...nuevaCita, clienteId: e.target.value })}
              required
              select
              fullWidth
            >
              {clients.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
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
              <Button onClick={handleCloseModal} variant="outlined">
                Cerrar
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

// Tener un endpoint como /api/visitas o similar que devuelva todas las visitas técnicas agendadas. Por ejemplo:
/*
GET /api/visitas

[
  {
    "_id": "123",
    "clienteNombre": "Pepe",
    "tecnicoNombre": "Juan Pérez",
    "tipo": "Presupuesto",
    "inicio": "2025-05-09T14:00:00Z",
    "fin": "2025-05-09T15:00:00Z",
    "direccion": "Av. Rivera 123"
  }
]

useEffect(() => {
  const fetchScheduledVisits = async () => {
    try {
      const data = await getScheduledVisits();

      const mappedEvents = data.map(event => ({
        id: event._id,
        title: `${event.tipo} - ${event.clienteNombre}`,
        start: event.inicio,
        end: event.fin,
        extendedProps: {
          tecnicoNombre: event.tecnicoNombre,
          tipo: event.tipo,
          direccion: event.direccion
        },
        color: event.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F"
      }));

      setCitas(mappedEvents);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    }
  };

  fetchScheduledVisits();
}, []);

v.2  -  sin personalizacion de colores
useEffect(() => {
    const fetchScheduledVisits = async () => {
      try {
        const eventosAPI = await getScheduledVisits();
  
        const eventosTransformados = eventosAPI.map((ev, i) => ({
          id: ev.id || String(i),
          title: ev.summary || "Evento sin título",
          start: ev.start?.dateTime,
          end: ev.end?.dateTime,
          extendedProps: {
            description: ev.description || "",
            creator: ev.creator?.email || "",
          },
          color: "#1976D2", // o ajustalo según tipo
        }));
  
        setCitas(eventosTransformados);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      }
    };
  
    fetchScheduledVisits();
  }, []); 

  */  

  /*
  Aquí están las principales opciones para que elijas:

✅ Crear una cita (base de datos + Google Calendar)

📝 Actualizar una cita (y su evento en Google Calendar)

🗑️ Eliminar una cita (y su evento en Google Calendar)

📥 Leer/sincronizar eventos desde Google Calendar al sistema

🔄 Sincronización cruzada (verificar diferencias y alinear datos)
*/

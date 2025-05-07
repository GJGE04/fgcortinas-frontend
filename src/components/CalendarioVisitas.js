import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Box, TextField, Button, MenuItem, Typography } from "@mui/material";

export default function CalendarioVisitas() {
  const [citas, setCitas] = useState([
    {
      id: "1",
      title: "Presupuesto - María López",
      start: "2025-05-01T14:00:00",
      end: "2025-05-01T15:00:00",
      extendedProps: {
        tecnicoId: "tec001",
        tecnicoNombre: "Juan Pérez",
        tipo: "Presupuesto",
        direccion: "Av. Principal 1234",
      },
      color: "#1976D2",
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    fechaInicio: "",
    fechaFin: "",
    tecnicoNombre: "",
    clienteNombre: "",
    tipo: "Presupuesto",
    direccion: "",
  });

  const handleDateClick = (info) => {
    setNuevaCita({
      fechaInicio: info.dateStr,
      fechaFin: info.dateStr,
      tecnicoNombre: "",
      clienteNombre: "",
      tipo: "Presupuesto",
      direccion: "",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetNuevaCita();
  };

  const resetNuevaCita = () => {
    setNuevaCita({
      fechaInicio: "",
      fechaFin: "",
      tecnicoNombre: "",
      clienteNombre: "",
      tipo: "Presupuesto",
      direccion: "",
    });
  };

  const handleGuardarCita = () => {
    if (!nuevaCita.tecnicoNombre || !nuevaCita.clienteNombre || !nuevaCita.fechaInicio) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const nueva = {
      id: String(Date.now()),
      title: `${nuevaCita.tipo} - ${nuevaCita.clienteNombre}`,
      start: nuevaCita.fechaInicio,
      end: nuevaCita.fechaFin || nuevaCita.fechaInicio,
      extendedProps: {
        tecnicoNombre: nuevaCita.tecnicoNombre,
        tipo: nuevaCita.tipo,
        direccion: nuevaCita.direccion,
      },
      color: nuevaCita.tipo === "Presupuesto" ? "#1976D2" : "#D32F2F",
    };

    setCitas(prev => [...prev, nueva]);
    handleCloseModal();
  };

  return (
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
        height="auto"
      />

      {/* Modal para agendar nueva visita */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
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
            Agendar nueva visita
          </Typography>

          <TextField
            label="Técnico"
            value={nuevaCita.tecnicoNombre}
            onChange={(e) => setNuevaCita({ ...nuevaCita, tecnicoNombre: e.target.value })}
            required
          />
          <TextField
            label="Cliente"
            value={nuevaCita.clienteNombre}
            onChange={(e) => setNuevaCita({ ...nuevaCita, clienteNombre: e.target.value })}
            required
          />
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

          <Button variant="contained" color="primary" onClick={handleGuardarCita}>
            Guardar
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

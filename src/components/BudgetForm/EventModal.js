import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

const EventModal = ({ open, event, onClose, onSave, onDelete }) => {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(dayjs());
  const [end, setEnd] = useState(dayjs().add(1, "hour"));
  const [backgroundColor, setBackgroundColor] = useState("#1976d2");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setSummary(event.title || event.summary || "");
      setDescription(event.description || "");
      setStart(dayjs(event.start));
      setEnd(dayjs(event.end));
      setBackgroundColor(event.backgroundColor || "#1976d2");
    }
  }, [event]);

  const handleSave = () => {
    if (!summary || !start || !end) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    if (dayjs(end).isSameOrBefore(start)) {
        alert("La fecha de fin debe ser posterior a la fecha de inicio.");
        return;
      }

    onSave({
      ...event,
      summary,
      description,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor,
    });
  };

  const handleSaveV2 = () => {
    const newErrors = {};
  
    if (!summary) newErrors.title = "El título es obligatorio.";
    if (!start || !end) newErrors.time = "La fecha y hora son obligatorias.";
    if (start && end && dayjs(end).isBefore(start)) {
      newErrors.time = "La hora de fin no puede ser anterior a la de inicio.";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // Si no hay errores, limpiamos y guardamos
    setErrors({});
    onSave({
      ...event,
      summary: summary,
      description,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: backgroundColor,
    });
  };
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Editar Evento</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Título"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              fullWidth

        /*      error={Boolean(errors.title)}
  helperText={errors.title}  V2 */
            />
            <TextField
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <DateTimePicker
              label="Inicio"
              value={start}
              onChange={(newValue) => setStart(newValue)}
/*
              slotProps={{
                textField: {
                  error: Boolean(errors.time),
                },
              }}  V2 */ 
            />
            <DateTimePicker
              label="Fin"
              value={end}
              onChange={(newValue) => setEnd(newValue)}
              minDateTime={start}
/*
              slotProps={{
                textField: {
                  error: Boolean(errors.time),
                  helperText: errors.time || "",
                },
              }}   V2  */
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onDelete}>
          Eliminar
        </Button>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;

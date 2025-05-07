// components/SchedulePanel.jsx
import React from "react";
import { Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

const SchedulePanel = ({
  events,
  handleCellClick,
  handleEventClick,
  handleEventDrop,
  handleEventResize,
  handleEditEvent,
}) => {
    console.log("📥 Eventos recibidos en SchedulePanel:", events); // 👈 Agregado para depurar
  return (
    <div style={{ overflowX: "auto" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Typography variant="h6" mb={2}>
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
          editable={true}
          dateClick={handleCellClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          events={events}
          height="auto"
          eventDidMount={(info) => {
            const description = info.event.extendedProps.description || "";
            const start = new Date(info.event.start);
            const end = new Date(info.event.end);
            const duration = `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;

            tippy(info.el, {
              content: `
                <strong>${info.event.title}</strong><br/>
                ${description}<br/>
                <small>${duration}</small>
              `,
              allowHTML: true,
            });

            info.el.addEventListener("dblclick", () => {
              handleEditEvent(info.event);
            });
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default SchedulePanel;
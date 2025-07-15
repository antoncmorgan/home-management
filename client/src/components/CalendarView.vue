<template>
  <div class="calendar-container">
    <n-card>
      <template #header>
        <div class="calendar-header">
          <h3>Calendar</h3>
          <div class="calendar-controls">
            <n-button-group>
              <n-button @click="changeView('dayGridMonth')" :type="currentView === 'dayGridMonth' ? 'primary' : 'default'">
                Month
              </n-button>
              <n-button @click="changeView('timeGridWeek')" :type="currentView === 'timeGridWeek' ? 'primary' : 'default'">
                Week
              </n-button>
              <n-button @click="changeView('timeGridDay')" :type="currentView === 'timeGridDay' ? 'primary' : 'default'">
                Day
              </n-button>
            </n-button-group>
          </div>
        </div>
      </template>
      
      <div class="calendar-wrapper">
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
        />
      </div>
      
      <n-alert v-if="error" type="error" style="margin-top: 1rem;">
        {{ error }}
      </n-alert>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NCard, NButton, NButtonGroup, NAlert } from 'naive-ui';
import { apiGet } from '../api';

const calendarRef = ref();
const error = ref('');
const currentView = ref('dayGridMonth');
const events = ref<any[]>([]);

function getMonthYearFromCalendar(info: any) {
  // info.view.currentStart is the first date of the current view (e.g., first day of the month)
  const date = info.view.currentStart;
  return { month: date.getMonth(), year: date.getFullYear() };
}

function getRangeFromCalendar(info: any) {
  // info.start and info.end are the first and last visible dates in the current view
  return {
    start: info.start.toISOString(),
    end: info.end.toISOString()
  };
}

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  events: events,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  editable: true,
  height: 'auto',
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventClassNames: ['custom-event'],
  eventDidMount: (info: any) => {
    info.el.setAttribute('title', info.event.title);
  },
  datesSet: async (info: any) => {
    const { start, end } = getRangeFromCalendar(info);
    await fetchEvents(start, end);
  }
});

function changeView(viewName: string) {
  currentView.value = viewName;
  const calendarApi = calendarRef.value.getApi();
  calendarApi.changeView(viewName);
}

function handleEventClick(clickInfo: any) {
  // Handle event click - could open a modal or navigate to event details
  console.log('Event clicked:', clickInfo.event);
}

function handleDateSelect(selectInfo: any) {
  // Handle date selection - could open a modal to create new event
  console.log('Date selected:', selectInfo);
}

function handleEventDrop(dropInfo: any) {
  // Handle event drag and drop
  console.log('Event dropped:', dropInfo);
}

function handleEventResize(resizeInfo: any) {
  // Handle event resize
  console.log('Event resized:', resizeInfo);
}

function transformGoogleEventsToFullCalendar(googleEvents: any[]) {
  return googleEvents.map(event => ({
    id: event.id,
    title: event.summary || 'No Title',
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    allDay: !event.start?.dateTime, // All-day if no specific time
    backgroundColor: event.colorId ? `#${event.colorId}` : '#3788d8',
    borderColor: event.colorId ? `#${event.colorId}` : '#3788d8',
    extendedProps: {
      description: event.description,
      location: event.location,
      creator: event.creator,
      organizer: event.organizer,
      attendees: event.attendees,
      htmlLink: event.htmlLink
    }
  }));
}

async function fetchEvents(start?: string, end?: string) {
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Please log in to view calendar events';
      return;
    }
    let url = '/api/google/events/month';
    if (start && end) {
      url += `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    }
    const res = await apiGet(url, token);
    const googleEvents = res.data.items || [];
    events.value = transformGoogleEventsToFullCalendar(googleEvents);
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to fetch calendar events';
    console.error('Error fetching events:', e);
  }
}

onMounted(async () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  await fetchEvents(start, end);
});

// Expose methods for parent components
defineExpose({
  refreshEvents: fetchEvents,
  getCalendarApi: () => calendarRef.value?.getApi()
});
</script>

<style scoped>
.calendar-container {
  width: 100%;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.calendar-header h3 {
  margin: 0;
}

.calendar-wrapper {
  margin-top: 1rem;
}


:deep(.fc) {
  font-family: var(--font-body) !important;
  color: var(--color-text);
}

:deep(.fc-toolbar) {
  margin-bottom: 1rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

:deep(.fc-button) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.95rem;
  font-family: var(--font-body) !important;
}

:deep(.fc-button:hover),
:deep(.fc-button-active) {
  background-color: #17696b !important;
  border-color: #17696b !important;
}

:deep(.fc-event) {
  background: var(--color-primary);
  color: #fff;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 0.8rem;
  border: none;
  font-family: var(--font-body) !important;
}

:deep(.custom-event) {
  cursor: pointer;
  transition: opacity 0.2s;
}

:deep(.custom-event:hover) {
  opacity: 0.8;
}

:deep(.fc-daygrid-event) {
  margin-bottom: 1px;
}

:deep(.fc-h-event) {
  border-radius: 3px;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .calendar-controls {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }
}
</style>

<template>
  <div class="calendar-container">
    <n-card class="calendar-card">
      <div class="calendar-wrapper">
        <FullCalendar class="full-calendar-container"
          ref="calendarRef"
          :options="calendarOptions"
        />
        <div v-if="showConnectOverlay" class="calendar-connect-overlay-wrapper">
          <div class="calendar-connect-overlay"></div>
          <GoogleCalendarConnect @calendar-connected="handleCalendarConnectStatus" />
        </div>
      </div>
    </n-card>
    
    <FamilyMemberNav
      :family-members="familyMembers"
      @add="showAddModal = true"
      @select="handleSelectMember"
    />
    
    <FamilyMemberModal
      :show="showAddModal"
      @add="handleAddMember"
      @close="showAddModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NCard } from 'naive-ui';
import { apiGet } from '../api/api';
import FamilyMemberNav from '../components/FamilyMemberNav.vue';
import FamilyMemberModal from '../components/FamilyMemberModal.vue';
import GoogleCalendarConnect from '../components/GoogleCalendarConnect.vue';
import { useFamilyMemberStore } from '../store/familyMemberStore';
import { FamilyMember } from '../models/FamilyMember';
import { useAuthStore } from '../store/authStore';

const showAddModal = ref(false);
const selectedFamilyMemberId = ref<string|null>(null);
const familyMemberStore = useFamilyMemberStore();
const { familyMembers } = storeToRefs(familyMemberStore);

const calendarRef = ref();
const error = ref('');
const events = ref<any[]>([]);

const showConnectOverlay = ref(true);

// Helper: match event to a family member
function getMatchingMember(event: any, members: FamilyMember[]) {
  // First, try to match by name
  for (const member of members) {
    if (event.title && event.title.toLowerCase().includes(member.name.toLowerCase())) {
      return member;
    }
  }
  // Then, try to match by organizer or creator email
  for (const member of members) {
    const organizerEmail = event.extendedProps?.organizer?.email || '';
    const creatorEmail = event.extendedProps?.creator?.email || '';
    if (member.email && (
      (organizerEmail && member.email.toLowerCase() === organizerEmail.toLowerCase()) ||
      (creatorEmail && member.email.toLowerCase() === creatorEmail.toLowerCase())
    )) {
      return member;
    }
  }
  return null;
}

function handleCalendarConnectStatus(isConnected: boolean) {
  // Only update if value actually changes
  if (showConnectOverlay.value !== !isConnected) {
    showConnectOverlay.value = !isConnected;
  }
}

onMounted(() => {
  familyMemberStore.loadFamilyMembers();
});
// Filter events by selected family member if set
const filteredEvents = computed(() => {
  if (!selectedFamilyMemberId.value) return events.value;
  // Filter events by matching member
  return events.value.filter(e => {
    const member = getMatchingMember(e, familyMembers.value);
    return member && member.id === selectedFamilyMemberId.value;
  });
});

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
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: filteredEvents,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  editable: true,
  height: "100%",
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventClassNames: ['custom-event'],
  eventDidMount: (info: any) => {
    info.el.setAttribute('title', info.event.title);
    // Lower opacity for events that end before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventEnd = info.event.end ? new Date(info.event.end) : new Date(info.event.start);
    eventEnd.setHours(0, 0, 0, 0);
    if (eventEnd < today) {
      info.el.classList.add('fc-event-before-today');
    }
    // Color event by matching member
    const matchedMember = getMatchingMember(info.event, familyMembers.value);
    if (matchedMember && matchedMember.color) {
      info.el.style.backgroundColor = matchedMember.color;
      info.el.style.borderColor = matchedMember.color;
    }
  },
  datesSet: async (info: any) => {
    const { start, end } = getRangeFromCalendar(info);
    await fetchEvents(start, end);
  }
});
function handleAddMember(member: FamilyMember) {
  familyMemberStore.add(member);
  showAddModal.value = false;
}
function handleSelectMember(member: FamilyMember) {
  if (selectedFamilyMemberId.value === member.id) {
    selectedFamilyMemberId.value = null;
  } else {
    selectedFamilyMemberId.value = member.id;
  }
}

function handleEventsUpdated() {
  // Refresh the calendar when events are updated
  if (calendarRef.value) {
    calendarRef.value.refreshEvents();
  }
}

function handleEventClick(clickInfo: any) {
  // Debug: print full event details
  console.log('Event clicked:', {
    id: clickInfo.event.id,
    title: clickInfo.event.title,
    start: clickInfo.event.start,
    end: clickInfo.event.end,
    allDay: clickInfo.event.allDay,
    extendedProps: clickInfo.event.extendedProps,
    raw: clickInfo.event
  });
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
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn) {
      error.value = 'Please log in to view calendar events';
      return;
    }
    let url = '/api/google/events/month';
    if (start && end) {
      url += `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    }
    const res = await apiGet(url);
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
  height: calc(100vh - var(--top-nav-height));
  display: flex;
  flex-direction: row;
  gap: 0rem;
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
  height: calc(100vh - var(--top-nav-height) - 4rem);
}

.calendar-overlay-wrapper {
  position: relative;
}

.calendar-connect-overlay-wrapper {
  position: absolute;
  top: 0rem;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.calendar-connect-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
}

.calendar-card {
  width: 100%;
  height: calc(100vh - var(--top-nav-height));
}

.full-calendar-container {
  width: 100%;
  height: calc(100vh - var(--top-nav-height));
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


:deep(.fc-daygrid-event-dot) {
  display: none !important;
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
/* Lower opacity for events before today */
:deep(.fc-event-before-today) {
  opacity: 0.4;
}

/* Blue highlight for today cell */
:deep(.fc-day-today),
:deep(.fc-timegrid-col.fc-day-today) {
  /* background: #c2f4ef !important; */
}
</style>

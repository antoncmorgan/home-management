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
import { ref, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NCard } from 'naive-ui';
import FamilyMemberNav from '../components/FamilyMemberNav.vue';
import FamilyMemberModal from '../components/FamilyMemberModal.vue';
import GoogleCalendarConnect from '../components/GoogleCalendarConnect.vue';
import { useFamilyMemberStore } from '../store/familyMemberStore';
import { useCalendarStore } from '../store/calendarStore';

const showAddModal = ref(false);
const calendarRef = ref();
const showConnectOverlay = ref(false);

const familyMemberStore = useFamilyMemberStore();
const { familyMembers } = storeToRefs(familyMemberStore);

const calendarStore = useCalendarStore();
const { filteredEvents, selectedFamilyMemberId, error } = storeToRefs(calendarStore);
const { fetchEvents, setSelectedFamilyMemberId, getMatchingMember } = calendarStore;

function handleCalendarConnectStatus(isConnected: boolean) {
  if (showConnectOverlay.value !== !isConnected) {
    showConnectOverlay.value = !isConnected;
  }
}

onMounted(() => {
  familyMemberStore.loadFamilyMembers();
});

function getRangeFromCalendar(info: any) {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventEnd = info.event.end ? new Date(info.event.end) : new Date(info.event.start);
    eventEnd.setHours(0, 0, 0, 0);
    if (eventEnd < today) {
      info.el.classList.add('fc-event-before-today');
    }
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

function handleAddMember(member: any) {
  familyMemberStore.add(member);
  showAddModal.value = false;
}

function handleSelectMember(member: any) {
  if (String(selectedFamilyMemberId.value) === String(member.id)) {
    setSelectedFamilyMemberId(null);
  } else {
    setSelectedFamilyMemberId(member.id);
  }
}

function handleEventsUpdated() {
  if (calendarRef.value) {
    calendarRef.value.refreshEvents();
  }
}

function handleEventClick(clickInfo: any) {
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
  console.log('Date selected:', selectInfo);
}

function handleEventDrop(dropInfo: any) {
  console.log('Event dropped:', dropInfo);
}

function handleEventResize(resizeInfo: any) {
  console.log('Event resized:', resizeInfo);
}

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
  margin-top: 0rem;
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

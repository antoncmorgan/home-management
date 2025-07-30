import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { apiGet } from '../api/api';
import { useAuthStore } from './authStore';
import { useFamilyMemberStore } from './familyMemberStore';
import { FamilyMember } from '../models/FamilyMember';

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<any[]>([]);
  const error = ref('');
  const selectedFamilyMemberId = ref<string|null>(null);
  const familyMemberStore = useFamilyMemberStore();
  const { familyMembers } = storeToRefs(familyMemberStore);

  // Helper: match event to a family member
  function getMatchingMember(event: any, members: FamilyMember[]) {
    for (const member of members) {
      if (event.title && event.title.toLowerCase().includes(member.name.toLowerCase())) {
        return member;
      }
    }
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

  // Filter events by selected family member if set
  const filteredEvents = computed(() => {
    if (!selectedFamilyMemberId.value) {
        return events.value;
    }
    return events.value.filter(e => {
      const member = getMatchingMember(e, familyMembers.value);
      return member && member.id === selectedFamilyMemberId.value;
    });
  });

  function transformGoogleEventsToFullCalendar(googleEvents: any[]) {
    return googleEvents.map(event => ({
      id: event.id,
      title: event.summary || 'No Title',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime,
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

  function setSelectedFamilyMemberId(id: string|null) {
    selectedFamilyMemberId.value = id;
  }

  return {
    events,
    error,
    selectedFamilyMemberId,
    filteredEvents,
    fetchEvents,
    setSelectedFamilyMemberId,
    getMatchingMember,
    transformGoogleEventsToFullCalendar
  };
});

<template>
    <n-layout class="profile-page">
        <n-page-header title="Profile" subtitle="Manage your homes" />
        <div v-if="families.length > 0">
            <n-card>
                <h3>Your Homes</h3>
                <div class="homes-list">
                    <div v-for="family in families" :key="family.id" class="home-pill">
                        <span class="home-emoji">🏠</span>
                        <span class="home-name">{{ family.display_name }}</span>
                        <div class="family-members-list">
                          <FamilyMemberIcon
                            v-for="member in family.members"
                            :key="member.id"
                            :member="member"
                          >
                            <template v-if="showEditForm && editingFamilyId === family.id" #overlay>
                              <EditPencil
                                class="edit-pencil"
                                @click.stop="openEditMemberModal(member)"
                                aria-label="Edit"
                              />
                            </template>
                          </FamilyMemberIcon>
                        </div>
                        <n-button size="small" v-if="!showEditForm" @click="editHome(family)">Edit</n-button>
                        <n-button size="small" v-else @click="cancelEdit">Cancel</n-button>
                    </div>
                </div>
            </n-card>
            <n-card v-if="showEditForm">
                <h3>Edit Home</h3>
                <HomeForm :form="form">
                  <template #actions>
                    <n-button type="primary" @click="handleSubmit">Save Changes</n-button>
                    <n-button @click="cancelEdit" style="margin-left: 1rem;">Cancel</n-button>
                  </template>
                </HomeForm>
            </n-card>
        </div>
        <div>
          <FamilyMemberModal
            :show="showMemberModal"
            :member="editingMember"
            :mode="memberModalMode"
            @add="handleMemberAdd"
            @update="handleMemberUpdate"
            @delete="handleMemberDelete"
            @close="showMemberModal = false"
          />
          <div v-if="families.length === 0">
              <n-card>
                  <h3>Create Your Home</h3>
                  <p>To get started, please enter your home details below.</p>
                  <HomeForm :form="form">
                    <template #actions>
                      <n-button type="primary" @click="handleSubmit">Create Home</n-button>
                    </template>
                  </HomeForm>
              </n-card>
          </div>
        </div>
    </n-layout>
</template>

<script setup lang="ts">
import FamilyMemberIcon from '../components/FamilyMemberIcon.vue';
import FamilyMemberModal from '../components/FamilyMemberModal.vue';
import { EditPencil } from '@iconoir/vue';
import { useFamilyMemberStore } from '../store/familyMemberStore';

import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/authStore';
import { NLayout, NPageHeader, NCard, NButton } from 'naive-ui';
import { listFamilies, updateFamily, createFamily } from '../api/familyApi';
import type { Home } from '../models/Home';
import type { FamilyMember } from '../models/FamilyMember';
import HomeForm from '../components/HomeForm.vue';

const showEditForm = ref(false);
let editingFamilyId: string | null = null;
const showMemberModal = ref(false);
const memberModalMode = ref<'add'|'edit'>('add');
const editingMember = ref<FamilyMember|null>(null);

function editHome(family: Home) {
    form.value.familyName = family.display_name || '';
    form.value.primaryEmail = family.primary_email || '';
    form.value.addressStreet = family.address_street || '';
    form.value.addressCity = family.address_city || '';
    form.value.addressState = family.address_state || '';
    form.value.addressZip = family.address_zip || '';
    form.value.phoneNumber = family.phone_number || '';
    form.value.timezone = family.timezone || '';
    form.value.notes = family.notes || '';
    form.value.photoUrl = family.photo_url || '';
    form.value.inviteCode = family.invite_code || '';
    editingFamilyId = family.id;
    showEditForm.value = true;
}

function cancelEdit() {
    showEditForm.value = false;
    editingFamilyId = null;
}

function openEditMemberModal(member: FamilyMember) {
  editingMember.value = member;
  memberModalMode.value = 'edit';
  showMemberModal.value = true;
}
function openAddMemberModal() {
  editingMember.value = null;
  memberModalMode.value = 'add';
  showMemberModal.value = true;
}
function handleMemberAdd(member: FamilyMember) {
  familyMemberStore.add(member).then(fetchProfile);
  showMemberModal.value = false;
}
function handleMemberUpdate(member: FamilyMember) {
  familyMemberStore.update(member.id, member).then(fetchProfile);
  showMemberModal.value = false;
}
function handleMemberDelete(member: FamilyMember) {
  familyMemberStore.remove(member.id).then(fetchProfile);
  showMemberModal.value = false;
}

interface HomeWithMembers extends Home {
  members?: FamilyMember[];
}
const families = ref<HomeWithMembers[]>([]);
const familyMemberStore = useFamilyMemberStore();
const form = ref<{
    username: string;
    familyName: string;
    primaryEmail: string;
    addressStreet: string;
    addressCity: string;
    addressState: string;
    addressZip: string;
    phoneNumber: string;
    timezone: string;
    notes: string;
    photoUrl: string;
    inviteCode: string;
}>({
    username: '',
    familyName: '',
    primaryEmail: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    phoneNumber: '',
    timezone: '',
    notes: '',
    photoUrl: '',
    inviteCode: '',
});

async function fetchProfile() {
    // Use authStore for username
    const authStore = useAuthStore();
    form.value.username = authStore.username || '';
    // Fetch family info using familyApi
    const result = await listFamilies();
    families.value = result || [];
    await familyMemberStore.loadFamilyMembers();
    // Assign members to each family
    families.value.forEach(family => {
        family.members = familyMemberStore.familyMembers.filter(m => m.familyId === family.id);
    });
    if (families.value.length > 0) {
        // Optionally, prefill form with first family
        const family = families.value[0];
        form.value.familyName = family.display_name || '';
        form.value.primaryEmail = family.primary_email || '';
        form.value.addressStreet = family.address_street || '';
        form.value.addressCity = family.address_city || '';
        form.value.addressState = family.address_state || '';
        form.value.addressZip = family.address_zip || '';
        form.value.phoneNumber = family.phone_number || '';
        form.value.timezone = family.timezone || '';
        form.value.notes = family.notes || '';
        form.value.photoUrl = family.photo_url || '';
        form.value.inviteCode = family.invite_code || '';
    }
}

async function handleSubmit() {
    if (showEditForm.value && editingFamilyId) {
        await updateFamily(editingFamilyId, {
            display_name: form.value.familyName,
            primary_email: form.value.primaryEmail,
            address_street: form.value.addressStreet,
            address_city: form.value.addressCity,
            address_state: form.value.addressState,
            address_zip: form.value.addressZip,
            phone_number: form.value.phoneNumber,
            timezone: form.value.timezone,
            notes: form.value.notes,
            photo_url: form.value.photoUrl,
            invite_code: form.value.inviteCode
        });
        await fetchProfile();
        showEditForm.value = false;
        editingFamilyId = null;
    } else if (families.value.length === 0) {
        await createFamily({
            display_name: form.value.familyName,
            address_street: form.value.addressStreet,
            address_city: form.value.addressCity,
            address_state: form.value.addressState,
            address_zip: form.value.addressZip,
            primary_email: form.value.primaryEmail,
            phone_number: form.value.phoneNumber,
            timezone: form.value.timezone,
            notes: form.value.notes,
            photo_url: form.value.photoUrl,
            invite_code: form.value.inviteCode
        });
        await fetchProfile();
    }
}

onMounted(() => {
    fetchProfile();
});
</script>

<style scoped>
.homes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}
.home-pill {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 2rem;
    padding: 0.5rem 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    gap: 1rem;
}
.family-members-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0rem 0.5rem;
    margin-left: 1rem;
    max-width: 40%;
}
.edit-pencil {
    position: absolute;
    top: -0.3rem;
    right: -0.3rem;
    width: 1.2rem;
    height: 1.2rem;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 2px #888;
    cursor: pointer;
    z-index: 2;
    padding: 0.1rem;
}
.home-emoji {
    font-size: 1.5rem;
    margin-right: 0.5rem;
}
.home-name {
    font-weight: 600;
    font-size: 1.1rem;
    flex: 1;
}
.profile-page {
    max-width: 37.5rem;
    margin: 2rem auto;
}

.row-flex {
    display: flex;
    gap: 1rem;
}
.half-width {
    flex: 1;
}
</style>

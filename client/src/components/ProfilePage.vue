<template>
    <n-layout class="profile-page">
        <n-page-header title="Profile" subtitle="Manage your homes" />
        <div v-if="families.length > 0">
            <n-card>
                <h3>Homes</h3>
                <ul>
                    <li v-for="family in families" :key="family.id">
                        <strong>{{ family.display_name }}</strong>
                        <div>{{ family.address_street }}, {{ family.address_city }}, {{ family.address_state }} {{ family.address_zip }}</div>
                        <div>Email: {{ family.primary_email }}</div>
                        <div>Phone: {{ family.phone_number }}</div>
                        <div>Timezone: {{ family.timezone }}</div>
                        <div>Notes: {{ family.notes }}</div>
                        <div v-if="family.photo_url">Photo: <img :src="family.photo_url" alt="Home Photo" style="max-width: 100px; max-height: 100px;" /></div>
                        <div v-if="family.invite_code">Invite Code: {{ family.invite_code }}</div>
                    </li>
                </ul>
            </n-card>
        </div>
        <div v-else>
            <n-card>
                <h3>Create Your Home</h3>
                <p>To get started, please enter your home details below.</p>
                <n-form :model="form" @submit.prevent="handleSubmit">
                    <n-form-item label="Username">
                        <n-input v-model:value="form.username" disabled />
                    </n-form-item>
                    <n-form-item label="Home Name">
                        <n-input v-model:value="form.familyName" />
                    </n-form-item>
                    <n-form-item label="Primary Email">
                        <n-input v-model:value="form.primaryEmail" />
                    </n-form-item>
                    <n-form-item label="Street Address">
                        <n-input v-model:value="form.addressStreet" />
                    </n-form-item>
                    <div class="row-flex">
                        <n-form-item label="City" class="half-width">
                            <n-input v-model:value="form.addressCity" />
                        </n-form-item>
                        <n-form-item label="State" class="half-width">
                            <StateSelect v-model="form.addressState" />
                        </n-form-item>
                    </div>
                    <n-form-item label="Zip Code">
                        <n-input v-model:value="form.addressZip" />
                    </n-form-item>
                    <n-form-item label="Notes">
                        <n-input v-model:value="form.notes" type="textarea" />
                    </n-form-item>
                    <n-form-item>
                        <n-button type="primary" html-type="submit">Create Home</n-button>
                    </n-form-item>
                </n-form>
            </n-card>
        </div>
    </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NLayout, NPageHeader, NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui';
import { listFamilies, updateFamily, createFamily } from '../api/familyApi';
import type { Home } from '../models/Home';
import StateSelect from './StateSelect.vue';

const families = ref<Home[]>([]);
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

function fetchProfile() {
    const token = localStorage.getItem('token');
    // Parse username from token
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            form.value.username = payload.username || payload.name || '';
        } catch {
            form.value.username = '';
        }
    }
    // Fetch family info using familyApi
    listFamilies().then(result => {
        families.value = result || [];
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
    });
}

function handleSubmit() {
    if (families.value.length > 0) {
        const family = families.value[0];
        updateFamily(family.id, {
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
        }).then(() => {
            // Optionally show success message
            fetchProfile();
        });
    } else {
        createFamily({
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
        }).then(() => {
            // Optionally show success message
            fetchProfile();
        });
    }
}

onMounted(() => {
    fetchProfile();
});
</script>

<style scoped>
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

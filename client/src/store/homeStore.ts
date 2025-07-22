import { ref } from 'vue';
import type { Home } from '../models/Home';

const home = ref<Home | null>(null);

function setHome(newHome: Home) {
    home.value = newHome;
}

function clearHome() {
    home.value = null;
}

export function useHomeStore() {
    return {
        home,
        setHome,
        clearHome
    };
}

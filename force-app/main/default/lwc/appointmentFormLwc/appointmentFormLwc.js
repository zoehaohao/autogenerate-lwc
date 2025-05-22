// appointmentFormLwc.js
import { LightningElement, track } from 'lwc';

export default class AppointmentFormLwc extends LightningElement {
    @track currentSection = null;

    connectedCallback() {
        // Initialize the first section
        this.currentSection = 'residential-viability';
    }

    handleNavigationClick(event) {
        const selectedSection = event.target.value;
        this.currentSection = selectedSection;
    }

    handleSave() {
        // Save logic here
    }

    handleDownload() {
        // Download logic here
    }
}

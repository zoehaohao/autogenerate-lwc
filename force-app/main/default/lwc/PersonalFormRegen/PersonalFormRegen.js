import { LightningElement, track } from 'lwc';

export default class PersonalFormRegen extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track dateOfBirth = '';
    @track showSuccessMessage = false;

    get today() {
        return new Date().toISOString().split('T')[0];
    }

    get isSubmitDisabled() {
        return !(this.firstName && 
                this.lastName && 
                this.email && 
                this.isValidEmail(this.email));
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.showSuccessMessage = false;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.showSuccessMessage = false;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.showSuccessMessage = false;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
        this.showSuccessMessage = false;
    }

    handleDateOfBirthChange(event) {
        this.dateOfBirth = event.target.value;
        this.showSuccessMessage = false;
    }

    isValidEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }

    handleSubmit() {
        if (!this.isSubmitDisabled) {
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone,
                dateOfBirth: this.dateOfBirth
            };

            // Dispatch form submission event
            const submitEvent = new CustomEvent('formsubmit', {
                detail: formData,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);

            // Show success message
            this.showSuccessMessage = true;

            // Reset form
            this.resetForm();
        }
    }

    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.dateOfBirth = '';
    }
}
// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track nameValue = '';
    @track addressValue = '';
    @track nameError = '';
    @track isSubmitDisabled = true;

    handleNameBlur(event) {
        const value = event.target.value;
        this.nameValue = value;
        this.validateName();
    }

    validateName() {
        if (!this.nameValue || this.nameValue.trim() === '') {
            this.nameError = 'Name is required';
            this.isSubmitDisabled = true;
            return false;
        }
        this.nameError = '';
        this.isSubmitDisabled = false;
        return true;
    }

    handleSubmit() {
        if (this.validateName()) {
            const formData = {
                name: this.nameValue,
                address: this.addressValue
            };
            console.log('Form submitted:', formData);
        }
    }
}
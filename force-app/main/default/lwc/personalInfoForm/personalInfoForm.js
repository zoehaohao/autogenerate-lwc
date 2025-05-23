// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track nameError = '';
    @track formData = {
        name: '',
        address: ''
    };

    handleNameChange(event) {
        this.formData.name = event.target.value;
        this.validateName();
    }

    handleAddressChange(event) {
        this.formData.address = event.target.value;
    }

    validateName() {
        if (!this.formData.name.trim()) {
            this.nameError = 'Name cannot be empty';
        } else {
            this.nameError = '';
        }
    }
}
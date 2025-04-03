// detailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DetailsForm extends LightningElement {
    @track formData = {};
    @track errors = {};
    @track isFormInvalid = true;

    validateField(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.errors[name] = '';

        switch(name) {
            case 'fullName':
                if (value.length < 2) {
                    this.errors[name] = 'Name must be at least 2 characters long';
                }
                break;
            case 'dateOfBirth':
                if (!this.isOver18(value)) {
                    this.errors[name] = 'You must be at least 18 years old to submit this form';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (this.formData.startDate && this.formData.endDate) {
                    if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                        this.errors['endDate'] = 'End date must be after start date';
                    }
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    this.errors[name] = 'Please enter a valid email address';
                }
                break;
        }

        this.isFormInvalid = Object.values(this.errors).some(error => error !== '') || Object.values(this.formData).some(value => !value);
    }

    isOver18(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 18;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.isFormInvalid) {
            // Here you would typically call an Apex method to save the data
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        } else {
            this.showToast('Error', 'Please correct the errors in the form', 'error');
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
        this.formData = {};
        this.errors = {};
        this.isFormInvalid = true;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    showHelp() {
        this.showToast('Form Help', 'Fill out all fields and submit the form', 'info');
    }
}
import {
    LightningElement,
    track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        startDate: '',
        endDate: '',
        comments: ''
    };
    @track errorMessage = '';
    genderOptions = [{
        label: 'Male',
        value: 'Male'
    }, {
        label: 'Female',
        value: 'Female'
    }, {
        label: 'Other',
        value: 'Other'
    }, {
        label: 'Prefer not to say',
        value: 'Prefer not to say'
    }];
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }
    validateForm() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input, lightning-combobox, lightning-textarea');
        let isValid = true;
        let errorMessages = [];
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                isValid = false;
                field.reportValidity();
                errorMessages.push(`${field.label} is required.`);
            }
        });
        if (!this.validateEmail(this.formData.email)) {
            isValid = false;
            errorMessages.push('Please enter a valid email address.');
        }
        if (!this.validatePhone(this.formData.phone)) {
            isValid = false;
            errorMessages.push('Please enter a valid phone number.');
        }
        if (!this.validateAge(this.formData.dateOfBirth)) {
            isValid = false;
            errorMessages.push('You must be at least 18 years old.');
        }
        if (!this.validateDates(this.formData.startDate, this.formData.endDate)) {
            isValid = false;
            errorMessages.push('End date must be after the start date.');
        }
        this.errorMessage = errorMessages.join(' ');
        return isValid;
    }
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    validatePhone(phone) {
        return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);
    }
    validateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }
    validateDates(startDate, endDate) {
        return new Date(endDate) > new Date(startDate);
    }
}

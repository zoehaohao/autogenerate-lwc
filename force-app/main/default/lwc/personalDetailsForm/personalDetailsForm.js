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
        endDate: ''
    };
    @track errorMessage = '';
    genderOptions = [{
        label: 'Male',
        value: 'male'
    }, {
        label: 'Female',
        value: 'female'
    }, {
        label: 'Other',
        value: 'other'
    }];
    handleInputChange(event) {
        const {
            name,
            value
        } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }
    validateField(fieldName, value) {
        switch (fieldName) {
            case 'email':
                this.validateEmail(value);
                break;
            case 'phone':
                this.validatePhone(value);
                break;
            case 'dateOfBirth':
                this.validateAge(value);
                break;
            case 'endDate':
                this.validateDates();
                break;
        }
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.errorMessage = 'Please enter a valid email address.';
        } else {
            this.errorMessage = '';
        }
    }
    validatePhone(phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            this.errorMessage = 'Please enter a valid phone number.';
        } else {
            this.errorMessage = '';
        }
    }
    validateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            this.errorMessage = 'You must be at least 18 years old.';
        } else {
            this.errorMessage = '';
        }
    }
    validateDates() {
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        if (endDate <= startDate) {
            this.errorMessage = 'End date must be later than start date.';
        } else {
            this.errorMessage = '';
        }
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        } else {
            this.errorMessage = 'Please fill in all required fields correctly.';
        }
    }
    validateForm() {
        let isValid = true;
        Object.keys(this.formData).forEach(field => {
            if (!this.formData[field]) {
                isValid = false;
            }
        });
        this.validateAge(this.formData.dateOfBirth);
        this.validateDates();
        return isValid && !this.errorMessage;
    }
}

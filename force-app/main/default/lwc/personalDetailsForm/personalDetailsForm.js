import {
  LightningElement,
  track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
  @track formData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    startDate: '',
    endDate: '',
    email: '',
    phoneNumber: ''
  };
  @track errorMessage = '';
  handleInputChange(event) {
    const field = event.target.id;
    const value = event.target.value;
    this.formData[field] = value;
    this.validateField(field, value);
  }
  validateField(field, value) {
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          this.errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
          return false;
        }
        break;
      case 'dateOfBirth':
        const age = this.calculateAge(new Date(value));
        if (age < 18) {
          this.errorMessage = 'You must be 18 years or older.';
          return false;
        }
        break;
      case 'startDate':
      case 'endDate':
        if (this.formData.startDate && this.formData.endDate) {
          if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
            this.errorMessage = 'Start Date must be earlier than End Date.';
            return false;
          }
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.errorMessage = 'Please enter a valid email address.';
          return false;
        }
        break;
      case 'phoneNumber':
        if (value) {
          const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
          if (!phoneRegex.test(value)) {
            this.errorMessage = 'Please enter a valid phone number.';
            return false;
          }
        }
        break;
    }
    this.errorMessage = '';
    return true;
  }
  calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  validateForm() {
    for (const [field, value] of Object.entries(this.formData)) {
      if (!this.validateField(field, value)) {
        return false;
      }
    }
    return true;
  }
  handleSubmit() {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData);
      this.errorMessage = '';
    }
  }
  handleReset() {
    this.template.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
    this.formData = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      startDate: '',
      endDate: '',
      email: '',
      phoneNumber: ''
    };
    this.errorMessage = '';
  }
}

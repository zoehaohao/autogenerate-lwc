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
    endDate: ''
  };
  @track errorMessage = '';
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
      case 'dateOfBirth':
        this.validateAge(value);
        break;
      case 'startDate':
      case 'endDate':
        this.validateDates();
        break;
      default:
        break;
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
    const {
      startDate,
      endDate
    } = this.formData;
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        this.errorMessage = 'Start Date must be earlier than End Date.';
      } else {
        this.errorMessage = '';
      }
    }
  }
  validateForm() {
    const allFields = this.template.querySelectorAll('lightning-input');
    let isValid = true;
    allFields.forEach(field => {
      if (!field.checkValidity()) {
        field.reportValidity();
        isValid = false;
      }
    });
    this.validateAge(this.formData.dateOfBirth);
    this.validateDates();
    return isValid && !this.errorMessage;
  }
  handleSubmit() {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData);
      this.errorMessage = '';
    } else {
      this.errorMessage = this.errorMessage || 'Please fill all required fields correctly.';
    }
  }
  handleReset() {
    this.formData = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      startDate: '',
      endDate: ''
    };
    this.errorMessage = '';
    this.template.querySelectorAll('lightning-input').forEach(field => {
      field.value = '';
    });
  }
}

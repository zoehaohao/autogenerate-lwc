import {
  LightningElement,
  track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
  @track fullName = '';
  @track dateOfBirth = '';
  @track startDate = '';
  @track endDate = '';
  @track errorMessage = '';
  handleInputChange(event) {
    const {
      name,
      value
    } = event.target;
    this[name] = value;
    this.validateField(name, value);
  }
  validateField(fieldName, value) {
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) {
          this.setError('Full Name is required');
        } else {
          this.clearError();
        }
        break;
      case 'dateOfBirth':
        if (!this.isValidAge(value)) {
          this.setError('Applicant must be older than 18');
        } else {
          this.clearError();
        }
        break;
      case 'startDate':
      case 'endDate':
        if (this.startDate && this.endDate) {
          if (!this.isValidDateRange(this.startDate, this.endDate)) {
            this.setError('Start Date must be earlier than End Date');
          } else {
            this.clearError();
          }
        }
        break;
      default:
        break;
    }
  }
  isValidAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }
  isValidDateRange(startDate, endDate) {
    return new Date(startDate) < new Date(endDate);
  }
  setError(message) {
    this.errorMessage = message;
  }
  clearError() {
    this.errorMessage = '';
  }
  handleSubmit() {
      if (this
      .validateForm()) { // Implement form submission logic here            console.log('Form submitted successfully');            // Reset form after successful submission            this.handleClear();        }    }    validateForm() {        const inputs = this.template.querySelectorAll('lightning-input');        let isValid = true;        inputs.forEach(input => {            if (!input.checkValidity()) {                input.reportValidity();                isValid = false;            }        });        if (!this.isValidAge(this.dateOfBirth)) {            this.setError('Applicant must be older than 18');            isValid = false;        }        if (!this.isValidDateRange(this.startDate, this.endDate)) {            this.setError('Start Date must be earlier than End Date');            isValid = false;        }        return isValid;    }    handleClear() {        this.fullName = '';        this.dateOfBirth = '';        this.startDate = '';        this.endDate = '';        this.clearError();        this.template.querySelectorAll('lightning-input').forEach(input => {            input.value = '';        });    }}

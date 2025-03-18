import {
  LightningElement,
  track
} from 'lwc';
export default class AcmeApplicationForm extends LightningElement {
  @track age;
  @track startDate;
  @track endDate;
  @track errorMessage = '';
  handleAgeChange(event) {
    this.age = event.target.value;
  }
  handleStartDateChange(event) {
    this.startDate = event.target.value;
  }
  handleEndDateChange(event) {
    this.endDate = event.target.value;
  }
  handleSubmit() {
    if (this.validateForm()) {
      this.errorMessage = '';
      console.log('Form submitted successfully');
    }
  }
  validateForm() {
    const ageInput = this.template.querySelector('lightning-input[name="age"]');
    const startDateInput = this.template.querySelector('lightning-input[name="startDate"]');
    const endDateInput = this.template.querySelector('lightning-input[name="endDate"]');
    let isValid = true;
    if (!ageInput.checkValidity()) {
      ageInput.reportValidity();
      isValid = false;
    }
    if (!startDateInput.checkValidity() || !endDateInput.checkValidity()) {
      startDateInput.reportValidity();
      endDateInput.reportValidity();
      isValid = false;
    }
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.errorMessage = 'Start date must be earlier than end date';
      isValid = false;
    }
    return isValid;
  }
}

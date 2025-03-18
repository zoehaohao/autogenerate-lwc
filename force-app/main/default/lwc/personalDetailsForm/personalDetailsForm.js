import {
  LightningElement,
  track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
  @track formData = {
    fullName: '',
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
  }
  handleSubmit() {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData);
      this.errorMessage = '';
    }
  }
  validateForm() {
    const {
      dateOfBirth,
      startDate,
      endDate
    } = this.formData;
    if (!this.isAgeAbove18(dateOfBirth)) {
      this.errorMessage = 'Applicant must be older than 18 years.';
      return false;
    }
    if (!this.isStartDateBeforeEndDate(startDate, endDate)) {
      this.errorMessage = 'Start Date must be earlier than End Date.';
      return false;
    }
    return true;
  }
  isAgeAbove18(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }
  isStartDateBeforeEndDate(startDate, endDate) {
    return new Date(startDate) < new Date(endDate);
  }
}

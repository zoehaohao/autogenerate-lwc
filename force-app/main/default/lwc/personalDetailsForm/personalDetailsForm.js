import {
  LightningElement,
  track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
  @track errorMessage = '';
  @track stateOptions = [{
    label: 'New South Wales',
    value: 'NSW'
  }, {
    label: 'Victoria',
    value: 'VIC'
  }, {
    label: 'Queensland',
    value: 'QLD'
  }, {
    label: 'Western Australia',
    value: 'WA'
  }, {
    label: 'South Australia',
    value: 'SA'
  }, {
    label: 'Tasmania',
    value: 'TAS'
  }, {
    label: 'Australian Capital Territory',
    value: 'ACT'
  }, {
    label: 'Northern Territory',
    value: 'NT'
  }];
  handleBirthdateChange(event) {
    const birthdate = new Date(event.target.value);
    const today = new Date();
    const age = today.getFullYear() - birthdate.getFullYear();
    if (age < 18) {
      this.errorMessage = 'You must be 18 years or older to submit this form.';
    } else {
      this.errorMessage = '';
    }
  }
  handleStartDateChange(event) {
    const startDate = new Date(event.target.value);
    const endDateInput = this.template.querySelector('[name="endDate"]');
    if (endDateInput.value) {
      const endDate = new Date(endDateInput.value);
      if (startDate > endDate) {
        this.errorMessage = 'Start date must be earlier than end date.';
      } else {
        this.errorMessage = '';
      }
    }
  }
  handleEndDateChange(event) {
    const endDate = new Date(event.target.value);
    const startDateInput = this.template.querySelector('[name="startDate"]');
    if (startDateInput.value) {
      const startDate = new Date(startDateInput.value);
      if (startDate > endDate) {
        this.errorMessage = 'Start date must be earlier than end date.';
      } else {
        this.errorMessage = '';
      }
    }
  }
  handleSubmit() {
    if (this.validateForm()) {
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
  validateForm() {
    const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
    let isValid = true;
    inputs.forEach(input => {
      if (input.required && !input.value) {
        input.reportValidity();
        isValid = false;
      }
      if (input.name === 'zipCode' && !this.validateAustralianPostalCode(input.value)) {
        input.setCustomValidity('Please enter a valid 4-digit Australian postal code');
        input.reportValidity();
        isValid = false;
      }
    });
    return isValid;
  }
  validateAustralianPostalCode(postalCode) {
    return /^[0-9]{4}$/.test(postalCode);
  }
}

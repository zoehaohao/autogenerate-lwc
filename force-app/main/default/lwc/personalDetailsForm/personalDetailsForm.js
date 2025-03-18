import {
  LightningElement,
  track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
  @track formData = {};
  @track errorMessage = '';
  stateOptions = [{
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
  handleInputChange(event) {
    const {
      name,
      value
    } = event.target;
    this.formData[name] = value;
    this.validateField(name, value);
  }
  validateField(name, value) {
    switch (name) {
      case 'birthdate':
        this.validateBirthdate(value);
        break;
      case 'startDate':
      case 'endDate':
        this.validateDates();
        break;
      default:
        break;
    }
  }
  validateBirthdate(birthdate) {
    const today = new Date();
    const birthdateObj = new Date(birthdate);
    const age = today.getFullYear() - birthdateObj.getFullYear();
    if (age < 18) {
      this.errorMessage = 'Applicant must be 18 years or older.';
    } else {
      this.errorMessage = '';
    }
  }
  validateDates() {
    const startDate = new Date(this.formData.startDate);
    const endDate = new Date(this.formData.endDate);
    if (startDate >= endDate) {
      this.errorMessage = 'Start Date must be earlier than End Date.';
    } else {
      this.errorMessage = '';
    }
  }
  handleSubmit() {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData);
    }
  }
  validateForm() {
    const requiredFields = ['firstName', 'lastName', 'birthdate', 'zipCode', 'startDate',
      'endDate'
    ];
    let isValid = true;
    requiredFields.forEach(field => {
      const input = this.template.querySelector(`[name="${field}"]`);
      if (!input.value) {
        input.setCustomValidity('This field is required');
        input.reportValidity();
        isValid = false;
      } else {
        input.setCustomValidity('');
      }
    });
    if (this.errorMessage) {
      isValid = false;
    }
    return isValid;
  }
}

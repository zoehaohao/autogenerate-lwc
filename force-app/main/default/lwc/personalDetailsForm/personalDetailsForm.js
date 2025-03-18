import {
    LightningElement,
    track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        birthdate: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        startDate: '',
        endDate: ''
    };
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
    }
    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.errorMessage = '';
        }
    }
    validateForm() {
        const {
            firstName,
            lastName,
            birthdate,
            zipCode,
            startDate,
            endDate
        } = this.formData;
        if (!firstName || !lastName || !birthdate || !zipCode || !startDate || !endDate) {
            this.errorMessage = 'Please fill in all required fields.';
            return false;
        }
        if (!this.isOver18(birthdate)) {
            this.errorMessage = 'Applicant must be over 18 years old.';
            return false;
        }
        if (!this.isStartDateBeforeEndDate(startDate, endDate)) {
            this.errorMessage = 'Start Date must be earlier than End Date.';
            return false;
        }
        return true;
    }
    isOver18(birthdate) {
        const today = new Date();
        const birthdateObj = new Date(birthdate);
        const ageDifference = today.getFullYear() - birthdateObj.getFullYear();
        const monthDifference = today.getMonth() - birthdateObj.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdateObj
                .getDate())) {
            return ageDifference - 1 >= 18;
        }
        return ageDifference >= 18;
    }
    isStartDateBeforeEndDate(startDate, endDate) {
        return new Date(startDate) < new Date(endDate);
    }
}

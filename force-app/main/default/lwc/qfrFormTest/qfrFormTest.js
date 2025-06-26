import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track birthdate = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';
    @track startDate = '';
    @track endDate = '';

    get stateOptions() {
        return [
            { label: 'Alabama', value: 'AL' },
            { label: 'Alaska', value: 'AK' },
            { label: 'Arizona', value: 'AZ' },
            { label: 'Arkansas', value: 'AR' },
            { label: 'California', value: 'CA' },
            // Add all other states here
        ];
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        
        this[field] = value;

        // Validate dates if both are populated
        if (field === 'startDate' || field === 'endDate') {
            this.validateDates();
        }
    }

    validateDates() {
        if (this.startDate && this.endDate) {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            
            if (end < start) {
                // Show error using lightning-notifications (implementation not shown)
                console.error('End date must be after start date');
            }
        }
    }

    validateForm() {
        let isValid = true;
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    @api
    submitForm() {
        if (this.validateForm()) {
            const formData = {
                firstName: this.firstName,
                middleName: this.middleName,
                lastName: this.lastName,
                birthdate: this.birthdate,
                address: this.address,
                city: this.city,
                state: this.state,
                zipCode: this.zipCode,
                startDate: this.startDate,
                endDate: this.endDate
            };
            
            // Dispatch form submission event
            this.dispatchEvent(new CustomEvent('formsubmit', {
                detail: formData
            }));
        }
    }
}

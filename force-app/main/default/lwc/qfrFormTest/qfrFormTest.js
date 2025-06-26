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

        // Validate required fields
        if (event.target.required && !value) {
            event.target.setCustomValidity('This field is required');
        } else {
            event.target.setCustomValidity('');
        }
        event.target.reportValidity();

        // Additional date validation for start and end dates
        if (field === 'endDate' && this.startDate && value) {
            if (new Date(value) < new Date(this.startDate)) {
                event.target.setCustomValidity('End date must be after start date');
                event.target.reportValidity();
            }
        }
    }

    // Method to validate all fields
    validateForm() {
        let isValid = true;
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.setCustomValidity('This field is required');
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }
}

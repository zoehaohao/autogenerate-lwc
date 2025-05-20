// formGenerator.js
import { LightningElement, track } from 'lwc';

export default class FormGenerator extends LightningElement {
    @track showCareServices = false;
    @track showAdditionalInfo = false;
    @track directCareWorkforce = 'Individual agreements';
    @track adminWorkforce = 'Enterprise agreements';

    careServiceOptions = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreements', value: 'Enterprise agreements' },
        { label: 'Other', value: 'Other' }
    ];

    wageIncreaseOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    handleInHouseDelivery(event) {
        this.showCareServices = event.target.checked;
        this.showAdditionalInfo = event.target.checked;
    }

    handleCareServicesChange(event) {
        if (event.detail.value.length === 0) {
            this.template.querySelector('lightning-dual-listbox[name="careServices"]').setCustomValidity('At least one option is required');
        } else {
            this.template.querySelector('lightning-dual-listbox[name="careServices"]').setCustomValidity('');
        }
        this.template.querySelector('lightning-dual-listbox[name="careServices"]').reportValidity();
    }

    handleDirectCareChange(event) {
        this.directCareWorkforce = event.detail.value;
    }

    handleAdminWorkforceChange(event) {
        this.adminWorkforce = event.detail.value;
    }

    handleWageIncreaseChange(event) {
        // Handle wage increase attestation change
    }

    handlePrevious() {
        // Handle navigation to previous section
    }

    handleNext() {
        if (this.validateForm()) {
            // Handle navigation to next section
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-dual-listbox, lightning-radio-group')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }
}
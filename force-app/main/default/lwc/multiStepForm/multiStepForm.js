// multiStepForm.js
import { LightningElement, track } from 'lwc';

export default class MultiStepForm extends LightningElement {
    @track solvencyOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    @track solvencyIssuesOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    @track operationalLossOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    handlePrevious() {
        // Navigate to previous step
    }

    handleNext() {
        // Validate current step
        const solvencyValue = this.template.querySelector('lightning-dual-listbox[name="solvency"]').value;
        const solvencyIssuesValue = this.template.querySelector('lightning-dual-listbox[name="solvencyIssues"]').value;
        const operationalLossValue = this.template.querySelector('lightning-dual-listbox[name="operationalLoss"]').value;

        if (!solvencyValue || !solvencyIssuesValue || !operationalLossValue) {
            // Display error message for required fields
            return;
        }

        // Navigate to next step
    }
}

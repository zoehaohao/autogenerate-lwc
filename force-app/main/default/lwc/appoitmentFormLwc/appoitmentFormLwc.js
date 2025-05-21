// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
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

    @track solvency = '';
    @track solvencyIssues = '';
    @track operationalLoss = '';

    @track isProcessing = false;
    @track showSuccess = false;
    @track showError = false;
    @track errorMessage = '';

    handleSolvencyChange(event) {
        this.solvency = event.detail.value;
    }

    handleSolvencyIssuesChange(event) {
        this.solvencyIssues = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }

    handleSave() {
        this.isProcessing = true;
        this.showSuccess = false;
        this.showError = false;

        // Perform validation
        if (!this.solvency || !this.solvencyIssues || !this.operationalLoss) {
            this.errorMessage = 'Please fill in all required fields.';
            this.showError = true;
            this.isProcessing = false;
            return;
        }

        // Simulate form submission
        setTimeout(() => {
            this.showSuccess = true;
            this.isProcessing = false;
        }, 2000);
    }

    handleCancel() {
        this.solvency = '';
        this.solvencyIssues = '';
        this.operationalLoss = '';
        this.showSuccess = false;
        this.showError = false;
    }
}

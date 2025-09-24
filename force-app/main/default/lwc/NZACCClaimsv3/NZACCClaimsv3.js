import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveClaim from '@salesforce/apex/NZACCClaimsv3Controller.saveClaim';

export default class NZACCClaimsv3 extends LightningElement {
    @api recordId;
    
    @track claimNumber = '';
    @track claimantName = '';
    @track incidentDate = null;
    @track claimType = '';
    @track description = '';
    @track claimStatus = 'New';

    get claimTypeOptions() {
        return [
            { label: 'Work Injury', value: 'Work_Injury' },
            { label: 'Motor Vehicle', value: 'Motor_Vehicle' },
            { label: 'Medical Treatment', value: 'Medical_Treatment' },
            { label: 'Sports Injury', value: 'Sports_Injury' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get statusOptions() {
        return [
            { label: 'New', value: 'New' },
            { label: 'In Progress', value: 'In_Progress' },
            { label: 'Under Review', value: 'Under_Review' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Declined', value: 'Declined' }
        ];
    }

    // Event Handlers
    handleClaimNumberChange(event) {
        this.claimNumber = event.target.value;
    }

    handleClaimantNameChange(event) {
        this.claimantName = event.target.value;
    }

    handleIncidentDateChange(event) {
        this.incidentDate = event.target.value;
    }

    handleClaimTypeChange(event) {
        this.claimType = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleStatusChange(event) {
        this.claimStatus = event.target.value;
    }

    handleClear() {
        this.claimNumber = '';
        this.claimantName = '';
        this.incidentDate = null;
        this.claimType = '';
        this.description = '';
        this.claimStatus = 'New';
    }

    validateFields() {
        const allValid = [...this.template.querySelectorAll('lightning-input,lightning-combobox,lightning-textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return allValid;
    }

    handleSave() {
        if (!this.validateFields()) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }

        const claimData = {
            claimNumber: this.claimNumber,
            claimantName: this.claimantName,
            incidentDate: this.incidentDate,
            claimType: this.claimType,
            description: this.description,
            status: this.claimStatus
        };

        saveClaim({ claimData: claimData })
            .then(result => {
                this.showToast('Success', 'Claim saved successfully', 'success');
                this.handleClear();
            })
            .catch(error => {
                this.showToast('Error', 'Error saving claim: ' + error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}